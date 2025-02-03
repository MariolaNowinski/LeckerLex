import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

function RecipeDetails() {
  const { id } = useParams();
  const { recipes, isFavorite, setIsFavorite, favorites, setFavorites } = useContext(RecipeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // Find the recipe by ID
  const recipe = recipes.find((x) => x.id === Number(id));

  // State declarations
  const [showMissingIngredients, setShowMissingIngredients] = useState(true);
  const [visibleSection, setVisibleSection] = useState(null);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [pauseBanner, setPauseBanner] = useState(false);
  const [servings, setServings] = useState(recipe?.servingsAmount || 1);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);

  // Toggle between sections (Ingredients, Nutrition, Preparation)
  const toggleSection = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
    setPauseBanner(visibleSection === section ? false : true);
  };

  // Toggle recipe as favorite
  const toggleFavorite = () => {
    const currentRecipe = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        amount: (ingredient.amount * servings).toFixed(1),
        unit: ingredient.unit,
      })),
      nutrition: recipe.nutritionPer100g,
      preparation: recipe.steps.map((step) => step.description),
    };

    if (isFavorite.includes(recipe.id)) {
      setIsFavorite(isFavorite.filter((favId) => favId !== recipe.id));
      setFavorites(favorites.filter((fav) => fav.id !== recipe.id));
    } else {
      setIsFavorite([...isFavorite, recipe.id]);
      setFavorites([...favorites, currentRecipe]);
      setShowFavoriteModal(true);
      setTimeout(() => setShowFavoriteModal(false), 3000);
    }
  };

  // Add missing ingredients to the shopping list
  const handleAddToShoppingList = async () => {
    try {
      if (!isLoggedIn) {
        navigate(`/home/login?redirectTo=/home/recipe-details/${id}`);
      } else {
        setShowShoppingListModal(true);
        const shoppingListItems = recipe.missedIngredients.map((item) => item.name);
        const formattedShoppingListItems = shoppingListItems.map((item) =>
          item.trim().toLowerCase()
        );
        const response = await fetch("http://localhost:3000/users/update-shoppinglist", {
          method: "PATCH",
          body: JSON.stringify({
            shoppingList: formattedShoppingListItems,
            action: "add",
          }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          console.log("Failed to update shopping list.");
        }
      }
    } catch (error) {
      console.log("Error while updating shopping list:", error);
    }
  };

  // Close the shopping list modal and missing ingredients window
  const handleCloseShoppingListModal = () => {
    setShowShoppingListModal(false);
    setShowMissingIngredients(false);
  };

  // Adjust servings
  const handleIncreaseServings = () => {
    setServings((prev) => Math.round((prev + 0.5) * 10) / 10);
  };
  const handleDecreaseServings = () => {
    setServings((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10));
  };

  // Dynamic text for servings
  const servingsText = `for ${servings} ${servings === 1 || servings === 0.5 ? "serving" : "servings"}`;

  if (!recipe) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <p className="text-center text-2xl font-semibold text-orange-100">Recipe not found 😔</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto relative bg-[#11151E] min-h-screen text-gray-50">
      {/* Recipe Image Section */}
      <div className="relative mx-auto w-full sm:w-8/12 lg:w-6/12 h-72 sm:h-80 lg:h-96 mt-20 rounded-2xl overflow-hidden shadow-2xl">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
        />
       { /* Favorite Icon */}
          <div className="absolute top-4 right-4">
            <button onClick={toggleFavorite} className="focus:outline-none">
              <FontAwesomeIcon
                icon={faHeart}
                size="2x"
                className="transition-colors duration-100 hover:text-red-500"
                color={isFavorite.includes(recipe.id) ? "#ff0000" : "#808080"}
              />
            </button>
          </div>
          {/* Overlay Title with pointer-events-none so it doesn't block clicks */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center pointer-events-none">
          <h2 className="text-center text-2xl md:text-3xl font-bold px-4">
            {recipe.title}
          </h2>
        </div>
      </div>

      {/* Section Control Buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-6">
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors"
          onClick={() => toggleSection("ingredients")}
        >
          Ingredients
        </button>
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors"
          onClick={() => toggleSection("nutrition")}
        >
          Nutritional Values
        </button>
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors"
          onClick={() => toggleSection("preparation")}
        >
          Preparation
        </button>
      </div>

      {/* Sections Content */}
      <div className="mt-10 space-y-8">
        {visibleSection === "ingredients" && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl text-center font-bold mb-8">Ingredients</h3>
            <div className="flex items-center justify-center space-x-4">
              {/* Modern Stepper Control */}
              <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                <button
                  onClick={handleDecreaseServings}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none"
                  aria-label="Decrease servings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-4 py-2 font-semibold text-gray-300">{servings}</span>
                <button
                  onClick={handleIncreaseServings}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none"
                  aria-label="Increase servings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <p className="text-xl text-white">Ingredients {servingsText}</p>
            </div>
            <ul className="list-disc pl-4 space-y-2 text-gray-300">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {(ingredient.amount * servings).toFixed(1)} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {visibleSection === "nutrition" && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Nutritional Values (per 100g)</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Calories: {recipe.nutritionPer100g.calories} kcal</li>
              <li>Fat: {recipe.nutritionPer100g.fat} g</li>
              <li>Saturated Fat: {recipe.nutritionPer100g.saturatedFat} g</li>
              <li>Carbohydrates: {recipe.nutritionPer100g.carbohydrates} g</li>
              <li>Sugar: {recipe.nutritionPer100g.sugar} g</li>
              <li>Protein: {recipe.nutritionPer100g.protein} g</li>
              <li>Sodium: {recipe.nutritionPer100g.sodium} g</li>
            </ul>
          </div>
        )}
        {visibleSection === "preparation" && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Preparation Steps</h3>
            {/* Modern Timeline for Preparation */}
            <div className="relative pl-10">
              {/* Vertical Line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-600"></div>
              {recipe.steps.map((step, index) => (
                <div key={index} className="mb-6 flex items-start">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg text-center">
                    {index + 1}
                  </div>
                  {/* Step Description */}
                  <div className="ml-4">
                    <p className="text-gray-300 text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Missing Ingredients Modal */}
      {showMissingIngredients &&
        recipe.missedIngredients &&
        recipe.missedIngredients.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-white text-gray-900 p-8 rounded-2xl w-11/12 sm:w-2/3 lg:w-1/3 transform transition-all animate-fade-in">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={() => setShowMissingIngredients(false)}
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center">Missing Ingredients</h3>
              <ul className="space-y-2 text-gray-700">
                {recipe.missedIngredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
              <button
                className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                onClick={handleAddToShoppingList}
              >
                Add to Shopping List
              </button>
              {showShoppingListModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
                  <div className="bg-white rounded-2xl shadow-xl p-8 w-11/12 sm:w-2/3 lg:w-1/3">
                    <h2 className="text-2xl font-bold mb-4 text-center">Item Added to Shopping List</h2>
                    <p className="text-gray-700 text-center mb-6">
                      The missing ingredients have been added to your shopping list.
                    </p>
                    <button
                      className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 w-full transition-colors"
                      onClick={handleCloseShoppingListModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


      {showFavoriteModal && (
        <div className="absolute top-28 right-28 bg-green-500 text-gray-50 px-4 py-2 rounded-3xl shadow-lg transition-opacity duration-300">
          Added to Favorites!
        </div>
      )}
    </div>
  );
}

export default RecipeDetails;
