
export function hasEventSportInterest(eventSport, attendeeSports) {
  if (!eventSport) return false;
  const attendee = Array.isArray(attendeeSports) ? attendeeSports : [];
  
  return attendee.some(sport => 
    sport && eventSport &&
    sport.toLowerCase().trim() === eventSport.toLowerCase().trim()
  );
}

 
export function getMutualSportInterests(creatorSports, attendeeSports) {
  const creator = Array.isArray(creatorSports) ? creatorSports : [];
  const attendee = Array.isArray(attendeeSports) ? attendeeSports : [];
  
  const mutual = creator.filter(sport => 
    attendee.some(attendeeSport => 
      attendeeSport && sport && 
      attendeeSport.toLowerCase().trim() === sport.toLowerCase().trim()
    )
  );
  
  return mutual;
}


export function checkCityMatch(creatorCity, attendeeCity) {
  if (!creatorCity || !attendeeCity) return false;
  
  return creatorCity.toLowerCase().trim() === attendeeCity.toLowerCase().trim();
}


export function checkstarMatch(eventSport, eventCity, attendeeSports, attendeeCity) {
  const hasEventSport = hasEventSportInterest(eventSport, attendeeSports);
  const hasCityMatch = checkCityMatch(eventCity, attendeeCity);
  
  return hasEventSport && hasCityMatch;
}

export function categorizeAttendees(creatorProfile, attendees) {
  const creatorSports = creatorProfile?.sports || [];
  const creatorCity = creatorProfile?.city || "";
  
  const categories = {
    mutualSports: [],
    cityMatch: [],
    starMatch: []
  };
  
  attendees.forEach(attendee => {
    const attendeeProfile = attendee.userProfile || {};
    const attendeeSports = attendeeProfile.sports || [];
    const attendeeCity = attendeeProfile.city || "";
    
    
    const hasMutualSports = getMutualSportInterests(creatorSports, attendeeSports).length > 0;
    const hasCityMatch = checkCityMatch(creatorCity, attendeeCity);
    const hasstarMatch = checkstarMatch(creatorSports, creatorCity, attendeeSports, attendeeCity);
    
    
    if (hasMutualSports) {
      categories.mutualSports.push({
        ...attendee,
        mutualSports: getMutualSportInterests(creatorSports, attendeeSports)
      });
    }
    
    if (hasCityMatch) {
      categories.cityMatch.push({
        ...attendee,
        cityMatch: true
      });
    }
    
    if (hasstarMatch) {
      categories.starMatch.push({
        ...attendee,
        starMatch: true,
        mutualSports: getMutualSportInterests(creatorSports, attendeeSports)
      });
    }
  });
  
  return categories;
}

