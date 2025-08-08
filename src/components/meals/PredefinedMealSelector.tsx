import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Scale, Calculator } from 'lucide-react';
import { mealService, type PredefinedMeal, type MealIngredient } from '../../services/mealService';
import './PredefinedMealSelector.css';

interface PredefinedMealSelectorProps {
    onMealSelected: (meal: PredefinedMeal, quantity: number, ingredientAdjustments: Array<{ ingredient_id: number, adjusted_weight: number }>) => void;
    onCancel: () => void;
}

const PredefinedMealSelector: React.FC<PredefinedMealSelectorProps> = ({
    onMealSelected,
    onCancel
}) => {
    const [predefinedMeals, setPredefinedMeals] = useState<PredefinedMeal[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeal, setSelectedMeal] = useState<PredefinedMeal | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [ingredientAdjustments, setIngredientAdjustments] = useState<Record<number, number>>({});
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPredefinedMeals();
        loadCategories();
    }, []);

    const loadPredefinedMeals = async () => {
        try {
            setLoading(true);
            const meals = await mealService.getPredefinedMeals(selectedCategory || undefined);
            setPredefinedMeals(meals);
        } catch (err) {
            setError('Failed to load predefined meals');
            console.error('Error loading predefined meals:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const cats = await mealService.getMealCategories();
            setCategories(cats);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    useEffect(() => {
        loadPredefinedMeals();
    }, [selectedCategory]);

    const filteredMeals = predefinedMeals.filter(meal =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMealSelect = (meal: PredefinedMeal) => {
        setSelectedMeal(meal);
        setQuantity(1);
        setIngredientAdjustments({});
        setShowDetails(true);
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const handleIngredientWeightChange = (ingredientId: number, newWeight: number) => {
        if (newWeight >= 0) {
            setIngredientAdjustments(prev => ({
                ...prev,
                [ingredientId]: newWeight
            }));
        }
    };

    const handleConfirm = () => {
        if (!selectedMeal) return;

        const adjustments = Object.entries(ingredientAdjustments).map(([id, weight]) => ({
            ingredient_id: parseInt(id),
            adjusted_weight: weight
        }));

        onMealSelected(selectedMeal, quantity, adjustments);
    };

    const calculateScaledNutrition = () => {
        if (!selectedMeal) return null;

        const nutrition = mealService.mealUtils.calculateScaledMealNutrition(
            selectedMeal,
            quantity,
            Object.entries(ingredientAdjustments).map(([id, weight]) => ({
                ingredient_id: parseInt(id),
                adjusted_weight: weight
            }))
        );

        return nutrition;
    };

    const scaledNutrition = calculateScaledNutrition();

    if (loading) {
        return (
            <div className="predefined-meal-selector">
                <div className="loading">Loading predefined meals...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="predefined-meal-selector">
                <div className="error">{error}</div>
                <button onClick={loadPredefinedMeals} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="predefined-meal-selector">
            <div className="selector-header">
                <h2>Choose from Predefined Meals</h2>
                <button onClick={onCancel} className="close-btn">×</button>
            </div>

            {!selectedMeal ? (
                <>
                    {/* Search and Filter */}
                    <div className="search-filter-section">
                        <div className="search-box">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search meals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-box">
                            <Filter className="filter-icon" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="category-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Meal List */}
                    <div className="meal-list">
                        {filteredMeals.length === 0 ? (
                            <div className="no-meals">
                                {searchTerm || selectedCategory ? 'No meals found matching your criteria.' : 'No predefined meals available.'}
                            </div>
                        ) : (
                            filteredMeals.map(meal => (
                                <div
                                    key={meal.id}
                                    className="meal-card"
                                    onClick={() => handleMealSelect(meal)}
                                >
                                    <div className="meal-info">
                                        <h3>{meal.name}</h3>
                                        {meal.description && <p className="meal-description">{meal.description}</p>}
                                        {meal.category && (
                                            <span className="meal-category">{meal.category}</span>
                                        )}
                                    </div>
                                    <div className="meal-nutrition">
                                        <div className="nutrition-item">
                                            <span className="label">Carbs:</span>
                                            <span className="value">{meal.total_carbs_per_portion}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="label">Weight:</span>
                                            <span className="value">{meal.total_weight_per_portion}g</span>
                                        </div>
                                    </div>
                                    <ChevronDown className="select-icon" />
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                /* Meal Details and Customization */
                <div className="meal-details">
                    <div className="details-header">
                        <button onClick={() => setSelectedMeal(null)} className="back-btn">
                            ← Back to Meals
                        </button>
                        <h3>{selectedMeal.name}</h3>
                    </div>

                    {selectedMeal.description && (
                        <p className="meal-description">{selectedMeal.description}</p>
                    )}

                    {/* Quantity Selector */}
                    <div className="quantity-section">
                        <label className="quantity-label">
                            <Scale className="quantity-icon" />
                            Number of Portions
                        </label>
                        <div className="quantity-controls">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="quantity-btn"
                            >
                                -
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= 10}
                                className="quantity-btn"
                            >
                                +
                            </button>
                        </div>
                        <span className="quantity-hint">(1-10 portions)</span>
                    </div>

                    {/* Ingredient Adjustments */}
                    <div className="ingredients-section">
                        <h4>Ingredients (adjust weights if needed)</h4>
                        <div className="ingredients-list">
                            {selectedMeal.ingredients.map(ingredient => {
                                const baseWeight = ingredient.base_weight * quantity;
                                const adjustedWeight = ingredientAdjustments[ingredient.id] ?? baseWeight;

                                return (
                                    <div key={ingredient.id} className="ingredient-item">
                                        <div className="ingredient-info">
                                            <span className="ingredient-name">{ingredient.name}</span>
                                            <span className="ingredient-carbs">
                                                {((adjustedWeight / 100) * ingredient.carbs_per_100g).toFixed(1)}g carbs
                                            </span>
                                        </div>
                                        <div className="ingredient-weight">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={adjustedWeight}
                                                onChange={(e) => handleIngredientWeightChange(ingredient.id, parseFloat(e.target.value) || 0)}
                                                className="weight-input"
                                            />
                                            <span className="weight-unit">g</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nutrition Summary */}
                    {scaledNutrition && (
                        <div className="nutrition-summary">
                            <h4>
                                <Calculator className="summary-icon" />
                                Total Nutrition
                            </h4>
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <span className="label">Total Carbs:</span>
                                    <span className="value">{scaledNutrition.total_carbs}g</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Total Weight:</span>
                                    <span className="value">{scaledNutrition.total_weight}g</span>
                                </div>
                                {selectedMeal.average_glycemic_index && (
                                    <div className="summary-item">
                                        <span className="label">Avg GI:</span>
                                        <span className="value">{selectedMeal.average_glycemic_index}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button onClick={onCancel} className="cancel-btn">
                            Cancel
                        </button>
                        <button onClick={handleConfirm} className="confirm-btn">
                            Add This Meal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredefinedMealSelector;
