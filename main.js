const search = document.querySelector(".searcher");
const container = document.querySelector(".article-container");
const button = document.querySelector(".main-btn");

async function foodInformation(itemName) {
  try {
    const foodUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${itemName}`;
    const foodResponse = await fetch(foodUrl);
    const foodData = await foodResponse.json();

    function displayIngredients() {
      const ingredientList = document.createElement("ul");

      ingredientList.classList.add("py-2");

      for (let i = 1; i <= 10; i++) {
        const ingredient = foodData.meals[0][`strIngredient${i}`];
        //const measure = meal[`strMeasure${i}`];

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
    }
    showItem();

    console.log(foodData);
  } catch (e) {
    console.log(e);
  }
}

button.addEventListener("click", function () {
  const inputText = search.value;

  container.classList.add("hidden");
  container.innerHTML = "";

  console.log("Input text:", inputText);

  foodInformation(inputText);
  search.value = "";
});
