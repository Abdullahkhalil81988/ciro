"""Maps crisis_type × response_tier → list of team names."""
from core.models import CrisisType, ResponseTier

ROUTING: dict[CrisisType, dict[ResponseTier, list[str]]] = {
    CrisisType.flood: {
        ResponseTier.local: ["Civil Defense HQ", "NDMA Regional"],
        ResponseTier.regional: ["NDMA National", "Provincial Disaster Auth"],
        ResponseTier.national: ["Army Engineering Corps", "PM Emergency Office"],
    },
    CrisisType.fire: {
        ResponseTier.local: ["Fire Department", "Rescue 1122"],
        ResponseTier.regional: ["Provincial Fire Authority"],
        ResponseTier.national: ["NDMA National", "Civil Aviation (if industrial)"],
    },
    CrisisType.cyber: {
        ResponseTier.local: ["CERT Team", "IT Security"],
        ResponseTier.regional: ["PTA Emergency"],
        ResponseTier.national: ["FIA Cyber Crime", "National CERT"],
    },
    CrisisType.civil: {
        ResponseTier.local: ["Local Police", "District Admin"],
        ResponseTier.regional: ["Rangers", "Provincial Home"],
        ResponseTier.national: ["Home Ministry", "Army"],
    },
    CrisisType.medical: {
        ResponseTier.local: ["District Health Office", "EDHI Foundation"],
        ResponseTier.regional: ["Provincial Health Dept"],
        ResponseTier.national: ["WHO Pakistan", "Federal Health Ministry"],
    },
    CrisisType.industrial: {
        ResponseTier.local: ["Fire Department", "Factory Safety"],
        ResponseTier.regional: ["EPA Provincial", "NDMA Regional"],
        ResponseTier.national: ["EPA Federal", "Hospital Network"],
    },
    CrisisType.heatwave: {
        ResponseTier.local: ["District Health Office"],
        ResponseTier.regional: ["Provincial Health Dept"],
        ResponseTier.national: ["NDMA National", "Federal Health Ministry"],
    },
    CrisisType.road_blockage: {
        ResponseTier.local: ["Traffic Police", "NHA Local"],
        ResponseTier.regional: ["NHA Regional"],
        ResponseTier.national: ["NHA HQ"],
    },
    CrisisType.unknown: {
        ResponseTier.local: ["District Admin", "Civil Defense"],
        ResponseTier.regional: ["NDMA Regional"],
        ResponseTier.national: ["NDMA National"],
    },
}


def get_teams(crisis_type: CrisisType, tier: ResponseTier) -> list[str]:
    type_map = ROUTING.get(crisis_type, ROUTING[CrisisType.unknown])
    teams = set()
    for t in ResponseTier:
        if t.value <= tier.value:
            teams.update(type_map.get(t, []))
    return list(teams)
