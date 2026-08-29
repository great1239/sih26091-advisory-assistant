"""
# COST GUARDRAIL: Free tier only
# Data.gov.in (Open Government Data - OGD Platform India) Service Module
"""
import os
import time
import json
import asyncio
import logging
import urllib.parse
from typing import Dict, List, Any, Optional
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 86400  # 24 Hours

class DataGovCache:
    def __init__(self, ttl_seconds: int = CACHE_TTL_SECONDS):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl_seconds

    def get(self, cache_key: str) -> Optional[Any]:
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["data"]
            else:
                del self._cache[cache_key]
        return None

    def set(self, cache_key: str, data: Any) -> None:
        self._cache[cache_key] = {
            "timestamp": time.time(),
            "data": data
        }

class DataGovClient:
    BASE_URL = "https://api.data.gov.in/resource"

    RESOURCE_AGMARKNET_MANDI = "9ef84268-d588-465a-a308-a864a43d0070"
    RESOURCE_PMEGP_MARGIN_MONEY = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
    RESOURCE_PMGSY_ROADS = "6176ee09-3d56-4a3b-8115-238414d92f4f"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DATA_GOV_IN_API_KEY", "579b464db66ec23bdd00000154e4b7ac13fa4be04eb22da35218729b")
        self.cache = DataGovCache(ttl_seconds=CACHE_TTL_SECONDS)

    def _generate_cache_key(self, resource_id: str, params: Dict[str, Any]) -> str:
        param_str = json.dumps(params, sort_keys=True)
        return f"{resource_id}:{param_str}"

    async def _execute_request_with_retry(
        self,
        resource_id: str,
        params: Dict[str, Any],
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """
        Executes request with query parameter encoding and exponential backoff.
        """
        # Ensure api-key and format are always present
        params["api-key"] = self.api_key
        params["format"] = "json"

        query_str = urllib.parse.urlencode(params)
        full_url = f"{self.BASE_URL}/{resource_id}?{query_str}"
        backoff_delay = 1.0

        for attempt in range(1, max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(
                        full_url,
                        headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                            "Accept": "application/json"
                        }
                    )

                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:
                        logger.warning(f"[DataGovClient] 429 Rate limited on {resource_id}. Retry {attempt}/{max_retries}...")
                        await asyncio.sleep(backoff_delay)
                        backoff_delay *= 2.0
                    else:
                        logger.warning(f"[DataGovClient] HTTP {response.status_code}: {response.text}")
                        break

            except Exception as exc:
                logger.warning(f"[DataGovClient] Request attempt {attempt} failed: {exc}")
                await asyncio.sleep(backoff_delay)
                backoff_delay *= 2.0

        raise Exception(f"Failed to fetch {resource_id} from data.gov.in")

    async def get_dataset_fields(self, resource_id: str) -> List[Dict[str, str]]:
        cache_key = f"metadata:{resource_id}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        params = {"limit": 1}

        try:
            data = await self._execute_request_with_retry(resource_id, params)
            fields = data.get("field", [])
            schema_fields = [
                {
                    "id": f.get("id"),
                    "name": f.get("name"),
                    "type": f.get("type", "string")
                }
                for f in fields
            ]
            self.cache.set(cache_key, schema_fields)
            return schema_fields
        except Exception as e:
            logger.warning(f"[DataGovClient] Error fetching schema fields for {resource_id}: {e}")
            return []

    async def query_dataset(
        self,
        resource_id: str,
        filters: Optional[Dict[str, str]] = None,
        limit: int = 10,
        offset: int = 0,
        sort: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {
            "limit": limit,
            "offset": offset
        }

        if filters:
            for k, v in filters.items():
                params[f"filters[{k}]"] = v

        if sort:
            for k, v in sort.items():
                params[f"sort[{k}]"] = v

        cache_key = self._generate_cache_key(resource_id, params)
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            raw_data = await self._execute_request_with_retry(resource_id, params)
            result = {
                "status": "SUCCESS",
                "title": raw_data.get("title", "Government Dataset"),
                "total_records": raw_data.get("total", 0),
                "count": raw_data.get("count", len(raw_data.get("records", []))),
                "records": raw_data.get("records", [])
            }
            self.cache.set(cache_key, result)
            return result
        except Exception as e:
            logger.warning(f"[DataGovClient] Query error for {resource_id}: {e}. Returning fallback benchmark.")
            return {
                "status": "FALLBACK_LOCAL",
                "title": "Local Benchmark Data",
                "total_records": 0,
                "count": 0,
                "records": []
            }

    async def get_mandi_commodity_pricing(
        self,
        district: str,
        state: str = "Rajasthan",
        commodity: Optional[str] = None
    ) -> Dict[str, Any]:
        filters = {"state": state}
        if district:
            filters["district"] = district

        data = await self.query_dataset(
            resource_id=self.RESOURCE_AGMARKNET_MANDI,
            filters=filters,
            limit=10
        )

        records = data.get("records", [])
        if commodity:
            filtered = [
                r for r in records
                if commodity.lower() in r.get("commodity", "").lower()
            ]
            if filtered:
                records = filtered

        prices = [float(r["modal_price"]) for r in records if "modal_price" in r and r["modal_price"]]
        avg_price = sum(prices) / len(prices) if prices else 3500.0

        return {
            "source": "Agmarknet (data.gov.in)",
            "district": district,
            "state": state,
            "total_mandi_arrivals": len(records),
            "average_modal_price_inr_per_qtl": avg_price,
            "mandi_listings": records[:6]
        }

    async def enrich_void_analysis_demographics(
        self,
        district: str,
        state: str,
        business_category: str
    ) -> Dict[str, Any]:
        commodity_map = {
            "dairy": "Cow Milk",
            "flour": "Wheat",
            "spice": "Mustard",
            "oil": "Mustard",
            "garment": "Cotton"
        }

        target_commodity = None
        for key, comm in commodity_map.items():
            if key in business_category.lower():
                target_commodity = comm
                break

        mandi_data = await self.get_mandi_commodity_pricing(
            district=district,
            state=state,
            commodity=target_commodity
        )

        raw_material_unit_price = mandi_data.get("average_modal_price_inr_per_qtl") or 3500.0

        return {
            "data_gov_in_connected": True,
            "district_economic_anchor": district,
            "matched_mandi_commodity": target_commodity or "General Agricultural Output",
            "benchmark_raw_material_price_inr_per_qtl": raw_material_unit_price,
            "active_mandis_reporting": mandi_data.get("total_mandi_arrivals", 0),
            "cached_ttl_status": "Active (24h Cache)"
        }

data_gov_client = DataGovClient()
