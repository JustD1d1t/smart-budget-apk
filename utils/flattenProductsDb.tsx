type Product = {
    name: string;
    category: string;
};

export const flattenProductsDb = (
    db: Record<string, (string | undefined)[]>
): Product[] => {
    return Object.entries(db).flatMap(([category, items]) =>
        items
            .filter((name): name is string => typeof name === "string")
            .map((name) => ({ name, category }))
    );
};