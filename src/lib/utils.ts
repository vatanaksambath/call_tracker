interface ISelectOption {
    value: string;
    label: string;
}

const formatApiDataForSelect = (data: any[], idKey: string, nameKey: string): ISelectOption[] => {

if (!Array.isArray(data)) {
    return [];
}

return data
    .filter(item => item && item[idKey] != null) 
    .map(item => ({
        value: String(item[idKey]),
        label: item[nameKey]
    }));
};

const parseDateString = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null;
    }
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
}

const formatDateForAPI = (date: Date | null): string | null => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export {
    formatApiDataForSelect, 
    parseDateString,
    formatDateForAPI
}