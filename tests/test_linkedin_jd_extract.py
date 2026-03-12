import pytest
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.scraper import extract_jd

from app.services.scraper import extract_jd

LINKEDIN_URL = (
    "https://www.linkedin.com/jobs/view/4376049736/"
    "?alternateChannel=search"
    "&eBP=CwEAAAGc4HmMdSiBtal2U2dPxQWx8qGuqc7UySr5kQx_9U_BY9b_x5oph8PJn8flg5h4XxhVlfpg47uf9pnui0su5h_xeD4dC2Un5FHFOma9KdJQkH-q6VrbBTXMWYZ_Dn0C5M9zZW4aTIVCglQVArfx3XW4-IujOmxBqKm7jm-qZdBHldRG9K9A4PqoD9yUv9ooCHEZuqAG7fRlOHFFZU5FWpxbWI67fmIP6I25UbIarPKyULUqFs_i6sfDab4RFmTpHu651OMKJlfw1poX5_DmJC57Unqbcpd2DnDlCAdnxWf-8LztD7aM1hSTrQ3jx__5V7-zXeG4oQKQjTMOoHWRpUCeJ68HOgytqRY-HIE7u0AV-7eMPGMfhrkzQNMBRqjQeBgrDDYIjFRYfvjBJ_UkYMOt03jHLlp_S7i-WwACAPT8Flaxw2hW5Ta3Q9ueEnmXYgc73t3ymi1YcrOHjSbsgkI_2RxN13buEE6UKlZiDOJLErQ9qumfTfElAJdoeIFl_vinZj4L5Q"
    "&refId=HtGtz9kGCf%2B2sRbw29t4hQ%3D%3D"
    "&trackingId=%2FemkkyLwfrn6k6ZSj%2Fh4qw%3D%3D"
)


@pytest.mark.asyncio
async def test_linkedin_live_scrape():
    result = await extract_jd(LINKEDIN_URL)

    print("\n── Scrape Result ──────────────────────────")
    print(f"Success:        {result.success}")
    print(f"Scrape method:  {result.scrape_method}")
    print(f"Title:          {result.title}")
    print(f"Company:        {result.company}")
    print(f"Location:       {result.location}")
    print(f"Description:    {result.description[:500]}...")
    print(f"Error:          {result.error}")
    print("───────────────────────────────────────────")

    assert result.success is True, f"Scrape failed: {result.error}"
    assert result.scrape_method == "browser"
    assert result.description is not None
    assert len(result.description) > 100, "Description too short — likely hit login wall"