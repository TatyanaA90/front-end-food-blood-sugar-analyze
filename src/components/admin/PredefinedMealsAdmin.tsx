import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Edit3 } from 'lucide-react';
import { mealService, type PredefinedMeal, type PredefinedMealCreate, type PredefinedMealIngredientCreate } from '../../services/mealService';

const emptyIngredient: PredefinedMealIngredientCreate = {
  name: '',
  base_weight: 0,
  carbs_per_100g: 0,
  glycemic_index: undefined,
  note: ''
};

const PredefinedMealsAdmin: React.FC = () => {
  const [meals, setMeals] = useState<PredefinedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PredefinedMealCreate>({
    name: '',
    description: '',
    category: '',
    is_active: true,
    created_by_admin: true,
    ingredients: [{ ...emptyIngredient }]
  });

  const loadMeals = async () => {
    try {
      setLoading(true);
      const data = await mealService.getPredefinedMeals();
      setMeals(data);
    } catch (e) {
      setError('Failed to load predefined meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMeals(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const cats = await mealService.getMealCategories();
        setCategories(cats);
      } catch {
        // ignore silently; fallback to free text if categories fail
      }
    })();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', category: '', is_active: true, created_by_admin: true, ingredients: [{ ...emptyIngredient }] });
    setFormOpen(true);
  };

  const openEdit = (meal: PredefinedMeal) => {
    setEditingId(meal.id);
    setForm({
      name: meal.name,
      description: meal.description,
      category: meal.category,
      is_active: true,
      created_by_admin: true,
      ingredients: meal.ingredients.map(i => ({
        name: i.name,
        base_weight: i.base_weight,
        carbs_per_100g: i.carbs_per_100g,
        glycemic_index: i.glycemic_index,
        note: i.note
      }))
    });
    setFormOpen(true);
  };

  const addIngredient = () => {
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, { ...emptyIngredient }] }));
  };

  const removeIngredient = (index: number) => {
    setForm(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  const updateIngredient = (index: number, field: keyof PredefinedMealIngredientCreate, value: any) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    }));
  };

  const save = async () => {
    try {
      if (editingId) {
        await mealService.updatePredefinedMeal(editingId, form);
      } else {
        await mealService.createPredefinedMeal(form);
      }
      setFormOpen(false);
      await loadMeals();
    } catch (e) {
      alert('Failed to save predefined meal');
    }
  };

  const remove = async (mealId: number) => {
    if (!confirm('Delete this predefined meal?')) return;
    try {
      await mealService.deletePredefinedMeal(mealId);
      await loadMeals();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete predefined meal';
      alert(errorMessage);
    }
  };

  if (loading) return <div>Loading predefined meals…</div>;
  if (error) return <div>{error}</div>;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Predefined Meals</h2>
        <button onClick={openCreate} className="btn">
          <Plus size={16} /> New
        </button>
      </div>

      <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
        {meals.map(m => (
          <div key={m.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{m.name}</strong>
                {m.category && <span style={{ marginLeft: 8, opacity: 0.7 }}>({m.category})</span>}
                {m.description && (
                  <div style={{ opacity: 0.8, marginTop: 4 }}>
                    {m.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(m)} className="btn">
                  <Edit3 size={16} /> Edit
                </button>
                <button onClick={() => remove(m.id)} className="btn btn-danger">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              Ingredients: {m.ingredients.map(i => i.name).join(', ') || '—'}
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <h3>{editingId ? 'Edit Predefined Meal' : 'New Predefined Meal'}</h3>
          <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Name</label>
              <input placeholder="e.g., Grilled Chicken Salad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Description (optional)</label>
              <textarea placeholder="Short description visible to users" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Category</label>
              {categories.length > 0 ? (
                <select value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category…</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input placeholder="e.g., breakfast, lunch, dinner" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              )}
              <small style={{ opacity: 0.8 }}>Used for filtering and defaults when users add from templates.</small>
            </div>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>

            <div>
              <h4>Ingredients</h4>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                Define ingredient name, base weight per portion, carbs per 100g, and optional glycemic index and description.
              </div>
              {form.ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 150px 120px 1fr auto', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label>Ingredient name</label>
                    <input placeholder="e.g., Rice (cooked)" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label>Base weight (g)</label>
                    <input type="number" step="0.1" placeholder="e.g., 150" value={ing.base_weight} onChange={e => updateIngredient(i, 'base_weight', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label>Carbs per 100g</label>
                    <input type="number" step="0.1" placeholder="e.g., 28" value={ing.carbs_per_100g} onChange={e => updateIngredient(i, 'carbs_per_100g', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label>Glycemic index (optional)</label>
                    <input type="number" step="0.1" placeholder="0-100" value={ing.glycemic_index ?? ''} onChange={e => updateIngredient(i, 'glycemic_index', e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label>Description (optional)</label>
                    <input placeholder="prep/details" value={ing.note || ''} onChange={e => updateIngredient(i, 'note', e.target.value)} />
                  </div>
                  <button onClick={() => removeIngredient(i)} className="btn btn-danger" title="Remove ingredient"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={addIngredient} className="btn" style={{ marginTop: 6 }}>
                <Plus size={14} /> Add Ingredient
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={save} className="btn">
                <Save size={16} /> Save
              </button>
              <button onClick={() => setFormOpen(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PredefinedMealsAdmin;


