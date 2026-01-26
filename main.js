let currentUser = null;

// Check for saved user on page load
window.onload = async () => {
  const savedUser = localStorage.getItem("recipeUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  } else {
    // Prompt for username on first visit
    const username = prompt("Enter a username to save favorites:");
    if (username) {
      const response = await fetch("http://localhost:3000/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      currentUser = await response.json();
      localStorage.setItem("recipeUser", JSON.stringify(currentUser));
    }
  }
  console.log("Logged in as:", currentUser);
};

const search = document.querySelector(".searcher");
const container = document.querySelector(".article-container");
const button = document.querySelector(".main-btn");
const listContainer = document.querySelector(".favorites-list");

// Accessing theMealDb API
async function foodInformation(itemName) {
  try {
    const foodUrl = `http://localhost:3000/api/search?q=${itemName}`;
    const foodResponse = await fetch(foodUrl);
    const foodData = await foodResponse.json();

    function displayIngredients() {
      const ingredientList = document.createElement("ul");

      ingredientList.classList.add("py-2");

      for (let i = 1; i <= 10; i++) {
        const ingredient = foodData.meals[0][`strIngredient${i}`];

        if (!ingredient) break;

        const li = document.createElement("li");
        li.classList.add("mx-5");
        li.innerHTML = ingredient;
        ingredientList.appendChild(li);
      }
      return ingredientList;
    }

    let mealName = foodData.meals[0].strMeal;
    let mealCategory = foodData.meals[0].strCategory;
    let mealThumbnail = foodData.meals[0].strMealThumb;

    // showing a recipe card on the html
    function showItem() {
      const element = document.createElement("div");
      element.innerHTML = `<div class="card-image rounded-2xl bg-cover bg-slate-400 h-96" style="background-image: url(${mealThumbnail})"></div>
        <h1 class="text-center py-4 text-3xl font-bold">${mealName}</h1>
        <div class="second-row flex justify-between px-2 text-2xl font-bold">
          <p>ingredients</p>
          <p>${mealCategory}</p>
        </div>`;

      element.appendChild(displayIngredients());
      container.classList.remove("hidden");
      container.appendChild(element);

      // saving recipe to favorite list
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save Recipe";
      saveBtn.className = "bg-green-500 text-white p-2 rounded mt-3 ml-2";
      saveBtn.onclick = async () => {
        if (!currentUser) {
          alert("Please enter a username first!");
          return;
        }

        const meal = foodData.meals[0];
        const response = await fetch("http://localhost:3000/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            mealId: meal.idMeal,
            mealName: meal.strMeal,
            mealThumb: meal.strMealThumb,
          }),
        });

        if (response.ok) {
          alert("✅ Recipe saved!");
          saveBtn.disabled = true;
          saveBtn.textContent = "Saved";
        } else {
          const error = await response.json();
          alert(error.error || "Already saved");
        }
      };
      element.appendChild(saveBtn);
    }
    showItem();

    console.log(foodData);
  } catch (e) {
    console.log(e);
  }
}

// searching recipe
button.addEventListener("click", function () {
  listContainer.innerHTML = "";
  const inputText = search.value;

  container.classList.add("hidden");
  container.innerHTML = "";

  console.log("Input text:", inputText);

  foodInformation(inputText);
  search.value = "";
});

// viewing favorites list if id matches
document.querySelector(".view-favorites").onclick = async () => {
  if (!currentUser) {
    alert("Please enter a username first!");
    return;
  }

  listContainer.classList.remove("hidden");
  listContainer.innerHTML = `
    <h2 class="text-2xl font-bold m-5">My Saved Recipes</h2>
    <p class="m-5 text-gray-500">Loading...</p>
  `;

  try {
    const response = await fetch(
      `http://localhost:3000/api/favorites/${currentUser.id}`,
    );
    const favorites = await response.json();

    // Clear loading message
    listContainer.innerHTML =
      '<h2 class="text-2xl font-bold m-5">My Saved Recipes</h2>';

    if (favorites.length === 0) {
      listContainer.innerHTML += '<p class="m-5">No favorites yet!</p>';
      return;
    }

    favorites.forEach((fav) => {
      const favItem = document.createElement("div");
      favItem.className =
        "m-5 p-3 bg-white rounded shadow min-h-30 min-w-30 inline-block !overflow-visible items-center text-center";
      favItem.dataset.mealId = fav.meal_id; // Store ID on element
      favItem.innerHTML = `
        <img src="${fav.meal_thumb}" class="w-20 h-20 object-cover rounded items ml-3">
        <span class="ml-3">${fav.meal_name}</span>
        <button onclick="deleteFavorite('${fav.meal_id}', this)" class="ml-3 text-red-500 hover:underline">Delete</button>
      `;
      listContainer.appendChild(favItem);
    });
  } catch (error) {
    listContainer.innerHTML = `
      <h2 class="text-2xl font-bold m-5">My Saved Recipes</h2>
      <p class="m-5 text-red-500">Error loading favorites</p>
    `;
  }
};

// Delete favorite function
async function deleteFavorite(mealId, buttonElement) {
  if (!confirm("Remove this favorite?")) return;

  const response = await fetch(
    `http://localhost:3000/api/favorites/${currentUser.id}/${mealId}`,
    { method: "DELETE" },
  );

  if (response.ok) {
    const favItem = buttonElement.closest("div");
    favItem.remove();

    // Check if list is now empty
    const listContainer = document.querySelector(".favorites-list");
    if (listContainer.children.length === 1) {
      listContainer.innerHTML = `
        <h2 class="text-2xl font-bold m-5">My Saved Recipes</h2>
        <p class="m-5">No favorites yet!</p>
      `;
    }

    alert("✅ Removed!");
  } else {
    alert("❌ Failed to remove");
  }
}
