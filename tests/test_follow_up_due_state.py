from datetime import datetime

from app.database import get_follow_up_due_state


def test_overdue():
    now = datetime(2026, 10, 12, 12, 0, 0)

    assert (
        get_follow_up_due_state(
            "2026-10-12T11:59:59",
            now=now
        )
        == "OVERDUE"
    )


def test_due_today():
    now = datetime(2026, 10, 12, 12, 0, 0)

    assert (
        get_follow_up_due_state(
            "2026-10-12T18:00:00",
            now=now
        )
        == "DUE TODAY"
    )


def test_upcoming():
    now = datetime(2026, 10, 12, 12, 0, 0)

    assert (
        get_follow_up_due_state(
            "2026-10-13T09:00:00",
            now=now
        )
        == "UPCOMING"
    )


def test_no_due_date():
    now = datetime(2026, 10, 12, 12, 0, 0)

    assert (
        get_follow_up_due_state(
            None,
            now=now
        )
        == "NO DUE DATE"
    )


def test_invalid_due_date():
    now = datetime(2026, 10, 12, 12, 0, 0)

    assert (
        get_follow_up_due_state(
            "not-a-date",
            now=now
        )
        == "NO DUE DATE"
    )
