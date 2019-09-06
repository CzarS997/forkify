// Global app controller
//428669996975cbe207e5f988cd54166e
//https://www.food2fork.com/api/search

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader} from './views/base'
import Likes from './models/Likes';
import * as likesView from './views/likesView';

/** Global state of the app
 * -Search object
 * -Current recipe object
 * -Shopping list object
 * -Liked recipes
 */
const state = {};

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput(); //TODO
    
    if(query){

        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{
        // 4) Search for recipes
        await state.search.getResults();

        // 5) Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);

        }catch(err){
            alert('Smth went wrong with the search');
            console.log(err);
            clearLoader();

        }
    }   

}

elements.searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    controlSearch();

});



elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        // data-* -> handy method
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        //console.log(goToPage);
    }
});

//RECIPE CONTROLLER

const controlRecipe = async () =>
{
    //Get ID from url
    const id = window.location.hash.replace('#', '');

    if(id){
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected item
        if(state.search) searchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);

       

        try{
        //Get recipe data and parse ingredients
        await state.recipe.getRecipe();
        console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();

        //Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        //Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        }catch(err){
            console.log(err);
            alert('Error processing recipe!');
        }
    }
};


['hashchange', 'load'].forEach((event) => window.addEventListener(event, controlRecipe));

// Click icon to reload and back to 'home page'
// Better solution: using <a href="..."></a> in HTML

/*
elements.logo.addEventListener('click', () => {
    
    window.location.reload(false);
    
});
*/

/*******
 * LIST CONTROLLER
 */

const controlList = () =>{
    // Create a new list if there in none yet
    if(!state.list) state.list = new List();

    elements.delItems.style.display = 'block';
   
    //  Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
     const item = state.list.addItem(el.count, el.unit, el.ingredient);
     listView.renderItem(item); 

     
    });

};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // Delete from state
        state.list.deleteItem(id);
        console.log(id);
        // Delete from UI
        listView.deleteItem(id);

        // Handle the count update
        //
    }   else if(e.target.matches('.shopping__count-value, .shopping__count-value *')){
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }

});

/*
** DELETE BUTTON
*/
elements.delItems.addEventListener('click', el => {
/* That one should be in some external file :/  */
    elements.delItems.style.display = 'none';
    state.list = undefined;
    elements.shopping.innerHTML = '';
    const markup = `<div class="alert">
    <span class="closebtn" onclick="$(this.parentElement).fadeOut();">&times;</span> 
    <strong>Shopping list has been deleted!</strong>
  </div>`;

    document.querySelector('.shopping__list').insertAdjacentHTML('afterend', markup);
    document.querySelector('.alert').style.display = 'none';
    $('.alert').fadeIn();
    //alert('All items from list has been removed!');

    setTimeout(() => {
        // a little bit jQuery
        $('.alert').fadeOut();
        
        let x = document.querySelector('.alert');
        setTimeout(() => {   x.parentNode.removeChild(x); }, 500);
       
        //That one below doesn't work
        //elements.info.parentNode.removeChild(elements.info);        
        
    }, 4500);
    

});


/*
* LIKE CONTROLLER
*/


const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        //Add like to the state

        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to UI list
        
        likesView.renderLike(newLike);

        // User has yet liked current recipe
    } else {

        //Remove like from the state
        state.likes.deleteLike(currentID);
        //Toggle the like button
        likesView.toggleLikeBtn(false);
        //Remove like to UI list
       likesView.deleteLike(currentID);


    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore likes recipes on page load

window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());


    //Render the existing likes
    if(state.likes.likes){
        state.likes.likes.forEach( like => likesView.renderLike(like));
    };
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {

    if(e.target.matches('.btn-decrease, .btn-decrease *')){

        //Decrease button is clicked
        if(state.recipe.servings > 1){
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
        };

    }   else if(e.target.matches('.btn-increase, .btn-increase *')){

        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){

        // Add ingredients to shoppping list
        controlList();
        
    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        // Like controller
        controlLike();

    }

    //console.log(state.recipe);


});



// Additionals functions








































