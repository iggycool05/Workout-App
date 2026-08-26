const MI_PER_KM = 0.621371

// Distance is always persisted in miles; these helpers convert for display/entry only.
export const milesToUnit = (miles, unit) => (unit === 'km' ? miles / MI_PER_KM : miles)
export const unitToMiles = (value, unit) => (unit === 'km' ? value * MI_PER_KM : value)
export const unitLabel = (unit) => (unit === 'km' ? 'km' : 'mi')
