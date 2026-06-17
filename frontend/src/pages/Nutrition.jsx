import { useState } from 'react';
import { Link } from 'react-router-dom';

const TRIMESTERS = [
  { id: 1, label: 'First Trimester', weeks: 'Weeks 1–12', color: 'bg-pink-50 border-pink-200' },
  { id: 2, label: 'Second Trimester', weeks: 'Weeks 13–26', color: 'bg-purple-50 border-purple-200' },
  { id: 3, label: 'Third Trimester', weeks: 'Weeks 27–40', color: 'bg-green-50 border-green-200' },
];

const SAFE_FOODS = {
  1: [
    { name: 'Beans & Lentils', emoji: '🫘', reason: 'Rich in folate, iron, and protein — essential for the baby\'s neural tube formation.' },
    { name: 'Eggs', emoji: '🥚', reason: 'Excellent source of protein and choline, which supports brain development.' },
    { name: 'Sweet Potatoes', emoji: '🍠', reason: 'High in vitamin A and C, important for the baby\'s cell growth and your immune system.' },
    { name: 'Groundnuts', emoji: '🥜', reason: 'Good source of folate, protein, and healthy fats.' },
    { name: 'Dark Leafy Greens', emoji: '🥬', reason: 'Spinach, isombe (cassava leaves), and kale are high in folate, iron, and calcium.' },
    { name: 'Whole Grains', emoji: '🌾', reason: 'Sorghum porridge and whole grain bread give energy and B vitamins.' },
    { name: 'Milk & Yogurt', emoji: '🥛', reason: 'Calcium and protein for baby\'s bone development. Use pasteurized milk only.' },
    { name: 'Fruits', emoji: '🍌', reason: 'Bananas, mangoes, avocados, and papayas give vitamins, folate, and natural energy.' },
  ],
  2: [
    { name: 'Fish', emoji: '🐟', reason: 'Low-mercury fish like tilapia are rich in omega-3 for brain and eye development.' },
    { name: 'Chicken & Meat', emoji: '🍗', reason: 'Cooked meat provides protein and iron for baby\'s growth and your energy.' },
    { name: 'Avocado', emoji: '🥑', reason: 'High in healthy fats, folate, and potassium. Supports baby\'s brain development.' },
    { name: 'Tomatoes', emoji: '🍅', reason: 'Rich in vitamin C and lycopene. Help your body absorb iron from other foods.' },
    { name: 'Carrots', emoji: '🥕', reason: 'Beta-carotene converts to vitamin A, important for baby\'s eye and skin development.' },
    { name: 'Corn', emoji: '🌽', reason: 'Provides fiber, B vitamins, and energy. A common and nutritious Rwandan staple.' },
    { name: 'Sorghum Porridge', emoji: '🥣', reason: 'Traditional Rwandan uji — high in iron, fiber, and energy for the growing belly.' },
    { name: 'Groundnut Paste', emoji: '🥜', reason: 'Protein, healthy fats, and B vitamins to support rapid fetal growth.' },
  ],
  3: [
    { name: 'Iron-rich Foods', emoji: '💪', reason: 'Beans, spinach, meat, and fortified cereals prevent anemia as blood volume increases.' },
    { name: 'Calcium Foods', emoji: '🦴', reason: 'Milk, yogurt, eggs, and dark greens support the baby\'s bone hardening in the final weeks.' },
    { name: 'Protein Foods', emoji: '🥚', reason: 'Eggs, beans, chicken, and groundnuts help the baby gain weight for birth.' },
    { name: 'Fiber Foods', emoji: '🫘', reason: 'Beans, vegetables, and whole grains prevent constipation, which is common in late pregnancy.' },
    { name: 'Water & Fluids', emoji: '💧', reason: 'Drink 8–10 glasses of clean water daily. Prevents UTIs, constipation, and preterm labor.' },
    { name: 'Small Frequent Meals', emoji: '🍽️', reason: 'As the uterus grows, smaller meals every 3 hours are easier to digest and prevent heartburn.' },
    { name: 'Bananas', emoji: '🍌', reason: 'Rich in potassium to reduce leg cramps, which are common in the third trimester.' },
    { name: 'Fish', emoji: '🐟', reason: 'Omega-3 fatty acids in the final weeks support baby\'s brain and lung maturation.' },
  ],
};

const UNSAFE_FOODS = [
  { name: 'Raw or undercooked meat', emoji: '🥩', risk: 'Can cause listeria and toxoplasmosis infections, which are dangerous for the baby.' },
  { name: 'Unpasteurized milk', emoji: '🥛', risk: 'Raw milk can contain listeria and other bacteria harmful to you and your baby.' },
  { name: 'Alcohol', emoji: '🍺', risk: 'No amount of alcohol is safe during pregnancy. It can cause serious birth defects.' },
  { name: 'Excess caffeine', emoji: '☕', risk: 'More than 1 cup of coffee per day is linked to low birth weight. Switch to herbal tea.' },
  { name: 'Raw fish / sushi', emoji: '🍣', risk: 'Raw fish can carry parasites and mercury that harm fetal brain development.' },
  { name: 'Papaya (unripe/latex)', emoji: '🫙', risk: 'Unripe papaya contains latex that can cause uterine contractions. Ripe papaya in moderation is fine.' },
  { name: 'Herbal remedies (unknown)', emoji: '🌿', risk: 'Many traditional herbal mixtures can stimulate contractions or cause miscarriage. Always consult a health worker.' },
  { name: 'Very salty foods', emoji: '🧂', risk: 'Excess salt causes water retention and swelling. It can worsen high blood pressure.' },
];

const HYDRATION_TIPS = [
  'Drink at least 8–10 glasses of clean water every day.',
  'Carry a water bottle wherever you go.',
  'If plain water is hard to drink, add a slice of lemon or mango.',
  'Drink more water in hot weather or after exercise.',
  'Limit sugary drinks and sodas — they can raise blood sugar.',
  'Coconut water is a good natural source of electrolytes.',
  'Signs of dehydration: dark yellow urine, dizziness, headache — drink water immediately.',
];

export default function Nutrition() {
  const [trimester, setTrimester] = useState(1);

  const t = TRIMESTERS.find(t => t.id === trimester);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">🥗 Nutrition Guide</h1>
      <p className="text-gray-500 text-sm mb-5">
        Eat well for you and your baby — with foods available in Rwanda
      </p>

      {/* Trimester selector */}
      <div className="flex gap-2 mb-6">
        {TRIMESTERS.map(tr => (
          <button
            key={tr.id}
            onClick={() => setTrimester(tr.id)}
            className={`flex-1 py-2 px-3 rounded-xl border text-center text-sm font-medium transition-all
              ${trimester === tr.id
                ? 'bg-bloom-rose text-white border-bloom-rose shadow-sm'
                : 'border-gray-200 text-gray-500 hover:border-pink-300'}`}
          >
            <div>{tr.label.replace(' Trimester', '')}</div>
            <div className={`text-xs font-normal mt-0.5 ${trimester === tr.id ? 'text-pink-100' : 'text-gray-400'}`}>
              {tr.weeks}
            </div>
          </button>
        ))}
      </div>

      {/* Safe foods */}
      <div className={`card mb-5 ${t.color}`}>
        <h2 className="font-semibold text-gray-700 mb-1">✅ Recommended Foods</h2>
        <p className="text-xs text-gray-400 mb-4">{t.label} · {t.weeks}</p>
        <div className="space-y-3">
          {SAFE_FOODS[trimester].map((food, i) => (
            <div key={i} className="flex gap-3 items-start bg-white rounded-xl p-3 shadow-sm">
              <span className="text-2xl flex-shrink-0">{food.emoji}</span>
              <div>
                <p className="font-medium text-gray-700 text-sm">{food.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{food.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unsafe foods */}
      <div className="card mb-5 bg-red-50 border-red-100">
        <h2 className="font-semibold text-gray-700 mb-1">⚠️ Foods to Avoid During Pregnancy</h2>
        <p className="text-xs text-gray-400 mb-4">These apply throughout all trimesters</p>
        <div className="space-y-3">
          {UNSAFE_FOODS.map((food, i) => (
            <div key={i} className="flex gap-3 items-start bg-white rounded-xl p-3 shadow-sm">
              <span className="text-2xl flex-shrink-0">{food.emoji}</span>
              <div>
                <p className="font-medium text-gray-700 text-sm">{food.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{food.risk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hydration */}
      <div className="card mb-5 bg-blue-50 border-blue-100">
        <h2 className="font-semibold text-gray-700 mb-3">💧 Hydration Tips</h2>
        <ul className="space-y-2">
          {HYDRATION_TIPS.map((tip, i) => (
            <li key={i} className="flex gap-2 items-start text-sm text-gray-600">
              <span className="text-bloom-green font-bold flex-shrink-0 mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Ask AI */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 text-center">
        <p className="text-2xl mb-2">💬</p>
        <h3 className="font-semibold text-gray-700 mb-1">Have a specific question?</h3>
        <p className="text-sm text-gray-500 mb-3">
          Ask BloomMama AI about nutrition for your current pregnancy week, local foods, or specific concerns.
        </p>
        <Link to="/chat" className="btn-primary inline-block">Ask BloomMama AI</Link>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-4 px-2">
        This guide is for general information. Always follow the advice of your doctor or midwife at your ANC visits.
      </p>
    </div>
  );
}
