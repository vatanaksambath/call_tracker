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

export default formatApiDataForSelect;