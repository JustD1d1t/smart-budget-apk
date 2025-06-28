import { Picker } from '@react-native-picker/picker';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import IngredientFormRow, { Ingredient, IngredientError } from '../IngredientFormRow';

describe('IngredientFormRow', () => {
  const defaultIngredient: Ingredient = { name: 'Tomato', quantity: 3, unit: 'kg' };
  const index = 0;
  let onChange: jest.Mock;
  let onRemove: jest.Mock;

  beforeEach(() => {
    onChange = jest.fn();
    onRemove = jest.fn();
  });

  it('renderuje wiersz składnika z autocomplete, input i selectem', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <IngredientFormRow
        index={index}
        ingredient={defaultIngredient}
        onChange={onChange}
        onRemove={onRemove}
      />
    );
    // Autocomplete jako Input z placeholderem
    const auto = getByPlaceholderText('Wpisz produkt...');
    expect(auto.props.value).toBe('Tomato');
    // Ilość
    const qty = getByPlaceholderText('Ilość');
    expect(qty.props.value).toBe('3');
    // Select-container i picker-container
    expect(getByTestId('select-container')).toBeTruthy();
    expect(getByTestId('select-picker-container')).toBeTruthy();
    // Przycisk usuń
    expect(getByText('🗑️')).toBeTruthy();
  });

  it('wywołuje onChange przy wpisywaniu nazwy', () => {
    const { getByPlaceholderText } = render(
      <IngredientFormRow index={index} ingredient={defaultIngredient} onChange={onChange} onRemove={onRemove} />
    );
    const auto = getByPlaceholderText('Wpisz produkt...');
    fireEvent.changeText(auto, 'Cucumber');
    expect(onChange).toHaveBeenCalledWith(index, { ...defaultIngredient, name: 'Cucumber' });
  });

  it('wywołuje onChange przy zmianie ilości', () => {
    const { getByPlaceholderText } = render(
      <IngredientFormRow index={index} ingredient={defaultIngredient} onChange={onChange} onRemove={onRemove} />
    );
    const qty = getByPlaceholderText('Ilość');
    fireEvent.changeText(qty, '5');
    expect(onChange).toHaveBeenCalledWith(index, { ...defaultIngredient, quantity: 5 });
  });

  it('wywołuje onChange przy zmianie jednostki', () => {
    const { getByTestId } = render(
      <IngredientFormRow index={index} ingredient={defaultIngredient} onChange={onChange} onRemove={onRemove} />
    );
    // znajdź wewnętrzny Picker
    const pickerContainer = getByTestId('select-picker-container');
    const picker = pickerContainer.findByType(Picker);
    fireEvent(picker, 'onValueChange', 'l');
    expect(onChange).toHaveBeenCalledWith(index, { ...defaultIngredient, unit: 'l' });
  });

  it('pokazuje błędy walidacji', () => {
    const errors: IngredientError = { name: 'Wymagana', quantity: 'Błędna', unit: 'Wybierz' };
    const { getByText } = render(
      <IngredientFormRow index={index} ingredient={defaultIngredient} errors={errors} onChange={onChange} onRemove={onRemove} />
    );
    expect(getByText('Wymagana')).toBeTruthy();
    expect(getByText('Błędna')).toBeTruthy();
    expect(getByText('Wybierz')).toBeTruthy();
  });

  it('wywołuje onRemove po naciśnięciu kosza', () => {
    const { getByText } = render(
      <IngredientFormRow index={index} ingredient={defaultIngredient} onChange={onChange} onRemove={onRemove} />
    );
    fireEvent.press(getByText('🗑️'));
    expect(onRemove).toHaveBeenCalledWith(index);
  });
});
