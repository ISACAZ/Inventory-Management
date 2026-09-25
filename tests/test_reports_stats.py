"""Tests for /api/reports/* and the co-borrowing recommendations."""

from fastapi import status


def _item(client, headers, name, qty=5):
    return client.post(
        "/api/items", json={"name": name, "total_quantity": qty}, headers=headers
    ).json()["id"]


def _borrow(client, headers, item_id, approve_with=None):
    rid = client.post(
        "/api/borrow", json={"item_id": item_id, "quantity": 1}, headers=headers
    ).json()["id"]
    if approve_with:
        client.post(f"/api/borrow/{rid}/approve", headers=approve_with)
    return rid


class TestReports:
    def test_inventory_csv(self, client, auth_header):
        _item(client, auth_header, "Scope")
        _item(client, auth_header, "=cmd()")
        resp = client.get("/api/reports/inventory", headers=auth_header)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.headers["content-type"].startswith("text/csv")
        assert "attachment" in resp.headers["content-disposition"]
        assert "Scope" in resp.text
        assert "'=cmd()" in resp.text  # formula neutralised

    def test_borrowing_csv_scoped_to_user(self, client, auth_header, user_auth_header):
        item = _item(client, auth_header, "Meter")
        _borrow(client, auth_header, item)
        _borrow(client, user_auth_header, item)
        admin_rows = client.get("/api/reports/borrowing", headers=auth_header).text.strip().splitlines()
        user_rows = client.get("/api/reports/borrowing", headers=user_auth_header).text.strip().splitlines()
        assert len(admin_rows) == 3  # header + 2
        assert len(user_rows) == 2  # header + own

    def test_borrowing_date_filter(self, client, auth_header):
        item = _item(client, auth_header, "Meter")
        _borrow(client, auth_header, item)
        resp = client.get("/api/reports/borrowing?start=2000-01-01&end=2000-01-02", headers=auth_header)
        assert len(resp.text.strip().splitlines()) == 1  # header only

    def test_unknown_report_and_auth(self, client, auth_header):
        assert client.get("/api/reports/nope", headers=auth_header).status_code == 422
        assert client.get("/api/reports/inventory").status_code == 401


class TestRecommendations:
    def test_co_borrowing(self, client, auth_header, user_auth_header):
        a, b, c = (_item(client, auth_header, n) for n in ("A", "B", "C"))
        for headers, approve in ((auth_header, None), (user_auth_header, auth_header)):
            _borrow(client, headers, a, approve)
            _borrow(client, headers, b, approve)
        _borrow(client, auth_header, c)  # only one user borrowed C, alongside A and B
        recs = client.get("/api/stats/recommendations", headers=auth_header).json()
        rec_a = next(r for r in recs if r["item_name"] == "A")
        assert rec_a["related_items"][0]["name"] in {"B", "C"}
        assert rec_a["related_items"][0]["name"] == "B"  # 2 shared users beats C's 1
        assert rec_a["confidence"] == 1.0

    def test_pending_requests_do_not_count(self, client, auth_header, user_auth_header):
        a, b = (_item(client, auth_header, n) for n in ("A", "B"))
        _borrow(client, user_auth_header, a)  # stays pending
        _borrow(client, user_auth_header, b)  # stays pending
        assert client.get("/api/stats/recommendations", headers=auth_header).json() == []

    def test_empty_without_history(self, client, auth_header):
        assert client.get("/api/stats/recommendations", headers=auth_header).json() == []
