import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

function SearchBar({
  searchText,
  setSearchText,
  handleSearch,
  handleAddIngredient,
  selectedIngredients,
}) {
  const [placeholder, setPlaceholder] = useState(
    "Enter here your ingredients..."
  );

  // Handle input changes IMPORTANT
  const handleInputChange = (e) => {
    const newSearchText = e.target.value;
    setSearchText(e.target.value);

    // IMPORTANTHandle adding the manually typed ingredient to the selected list
    if (newSearchText.includes(",")) {
      const ingredientsToAdd = searchText
        .split(",")
        .map((ingredient) =>
          ingredient
            .trim()
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase())
        )
        .filter((ingredient) => ingredient); // Filter out empty strings

      const uniqueIngredients = Array.from(
        new Set([...selectedIngredients, ...ingredientsToAdd])
      );
      handleAddIngredient(ingredientsToAdd);
      setSearchText("");
    }
  };

  return (
    <div className="text-center mb-4 px-4 mt-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl text-gray-800 font-medium sm:m-4">
          Cook with <span className="text-blue-600">What You've Got 😊</span>
        </h2>
        <p className="text-sm">Search here for your ingredients</p>
        <div className="mt-4 flex justify-center items-center sticky top-0">
          <label htmlFor="ingredient-search" className="sr-only">
            Search for recipes by ingredients
          </label>
          <div className="relative w-full max-w-sm sm:mb-6">
            <input
          id="ingredient-search"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-full shadow-md hover:shadow-lg focus:ring-1 focus:ring-green-800 transition duration-100 font-book placeholder-black"
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onFocus={() => setPlaceholder("")}
          onBlur={() =>
            setPlaceholder("Enter ingredients, separated by commas...")
          }
          aria-label="Search for recipes by ingredients"
            />
            <button
          className="absolute right-0 top-0 h-full px-4 bg-green-500 font-medium text-white rounded-full hover:bg-green-600 hover:scale-105 transition duration-300"
          onClick={handleSearch} // Search recipes based on the input
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
