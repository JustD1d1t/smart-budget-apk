export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: Ingredient[];
}

export type IngredientError = {
  name?: string;
  quantity?: string;
  unit?: string;
};
export type FormErrors = {
  name?: string;
  description?: string;
  ingredients?: string;
  ingredientFields: IngredientError[];
};
