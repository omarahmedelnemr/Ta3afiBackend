
interface EntityData {
    year: number;
    month: string;
    count: number;
}

function findMissingMonths(entitysData: EntityData[], fromDate: Date, toDate: Date): EntityData[] {
    // Create an object to store entity data by year and month
    const entitysMap: { [key: string]: EntityData } = {};
    
    // Populate the entitysMap with provided entity data
    for (const entity of entitysData) {
        entitysMap[`${entity.year}-${entity.month}`] = entity;
    }

    // Define an array of months to iterate through
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    // Define an array to store missing months
    const missingMonths: EntityData[] = [];

    // Get the start and end year and month from fromDate and toDate
    const startYear = fromDate.getFullYear();
    const startMonth = fromDate.getMonth() + 1; // Month is zero-based
    const endYear = toDate.getFullYear();
    const endMonth = toDate.getMonth() + 1; // Month is zero-based

    // Iterate through months within the given range of years
    for (let year = startYear; year <= endYear; year++) {
        const start = year === startYear ? startMonth : 1;
        const end = year === endYear ? endMonth : 12;

        for (let monthIndex = start; monthIndex <= end; monthIndex++) {
            const month = months[monthIndex - 1]; // Adjusting index
            const key = `${year}-${month}`;

            // If the month data doesn't exist in the entitysMap, add it to missingMonths with Count as 0
            if (!entitysMap[key]) {
                missingMonths.push({
                    year: year,
                    month: month,
                    count: 0
                });
            } else {
                // If the month data exists in the entitysMap, add it to missingMonths
                missingMonths.push(entitysMap[key]);
            }
        }
    }

    return missingMonths;
}


export default findMissingMonths;