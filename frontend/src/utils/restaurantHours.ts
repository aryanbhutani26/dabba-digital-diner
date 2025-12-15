// Utility functions for restaurant opening hours

export interface OpeningHours {
  monday: { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
  tuesday: { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
  wednesday: { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
  thursday: { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
  friday: { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export const isRestaurantOpen = (openingHours: OpeningHours): boolean => {
  // Get current time in UK timezone (GMT/UTC+00:00)
  const now = new Date();
  const ukTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
  
  const currentDay = ukTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = ukTime.getHours() * 60 + ukTime.getMinutes(); // Current time in minutes
  
  // Map day numbers to day names
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[currentDay] as keyof OpeningHours;
  
  const daySchedule = openingHours[dayName];
  
  if (!daySchedule) {
    return false; // No schedule defined for this day
  }
  
  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Check if it's a weekday (Monday-Friday) with lunch and dinner hours
  if (dayName !== 'saturday' && dayName !== 'sunday') {
    const weekdaySchedule = daySchedule as { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
    
    // Check lunch hours
    const lunchOpen = timeToMinutes(weekdaySchedule.lunch.open);
    const lunchClose = timeToMinutes(weekdaySchedule.lunch.close);
    
    // Check dinner hours
    const dinnerOpen = timeToMinutes(weekdaySchedule.dinner.open);
    const dinnerClose = timeToMinutes(weekdaySchedule.dinner.close);
    
    // Restaurant is open if current time is within lunch OR dinner hours
    const isLunchTime = currentTime >= lunchOpen && currentTime <= lunchClose;
    const isDinnerTime = currentTime >= dinnerOpen && currentTime <= dinnerClose;
    
    return isLunchTime || isDinnerTime;
  } else {
    // Weekend (Saturday/Sunday) - single operating period
    const weekendSchedule = daySchedule as { open: string; close: string };
    
    const openTime = timeToMinutes(weekendSchedule.open);
    const closeTime = timeToMinutes(weekendSchedule.close);
    
    return currentTime >= openTime && currentTime <= closeTime;
  }
};

export const getNextOpeningTime = (openingHours: OpeningHours): string => {
  const now = new Date();
  const ukTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
  
  const currentDay = ukTime.getDay();
  const currentTime = ukTime.getHours() * 60 + ukTime.getMinutes();
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  // Check today first
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDay = (currentDay + dayOffset) % 7;
    const dayName = dayNames[checkDay] as keyof OpeningHours;
    const daySchedule = openingHours[dayName];
    
    if (!daySchedule) continue;
    
    if (dayName !== 'saturday' && dayName !== 'sunday') {
      // Weekday - check lunch and dinner
      const weekdaySchedule = daySchedule as { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
      
      const lunchOpen = timeToMinutes(weekdaySchedule.lunch.open);
      const dinnerOpen = timeToMinutes(weekdaySchedule.dinner.open);
      
      // If it's today, only consider future times
      if (dayOffset === 0) {
        if (currentTime < lunchOpen) {
          return `Today at ${weekdaySchedule.lunch.open}`;
        } else if (currentTime < dinnerOpen) {
          return `Today at ${weekdaySchedule.dinner.open}`;
        }
      } else {
        // Future day
        const dayLabel = dayOffset === 1 ? 'Tomorrow' : dayNames[checkDay];
        return `${dayLabel} at ${weekdaySchedule.lunch.open}`;
      }
    } else {
      // Weekend
      const weekendSchedule = daySchedule as { open: string; close: string };
      const openTime = timeToMinutes(weekendSchedule.open);
      
      if (dayOffset === 0 && currentTime < openTime) {
        return `Today at ${weekendSchedule.open}`;
      } else if (dayOffset > 0) {
        const dayLabel = dayOffset === 1 ? 'Tomorrow' : dayNames[checkDay];
        return `${dayLabel} at ${weekendSchedule.open}`;
      }
    }
  }
  
  return 'Please check opening hours';
};

export const getCurrentOpeningStatus = (openingHours: OpeningHours): { isOpen: boolean; nextOpening: string; message: string } => {
  const isOpen = isRestaurantOpen(openingHours);
  const nextOpening = getNextOpeningTime(openingHours);
  
  if (isOpen) {
    return {
      isOpen: true,
      nextOpening: '',
      message: 'Restaurant is currently open for orders!'
    };
  } else {
    return {
      isOpen: false,
      nextOpening,
      message: `Restaurant is currently closed. We'll be open ${nextOpening}.`
    };
  }
};