import $ from 'jquery';

import store from './store';

import api from './api';

const generateItemElement = function (item) {
  function ratingLabel (item){
    let starsView = []
    if (item.rating >= 1){
     
      for (let i = 0; i < item.rating; i++){
        starsView.push(`<label class="starView" >☆</label>`)
      } 
    }
    return starsView.join(' ')
  }
  
  let itemTitle =   `
       <form class="js-edit-item-form">
      <div class="title-plus-Rating">
      <h3 value="${item.title}">${item.title}</h3>
        <div class="rating-box">
        ${ratingLabel(item)}
        </div>
      </div>
       </form> 
      <br>
      <label> Visit site:</label>
      <a href="${item.url}" target="new_blank">${item.url}</a>
   
      <section class="bookmark-desc">${item.desc}</section>
        <div class="error-container"></div>
      
        
        <button class="bookmark-item-toggle js-item-toggle">
          <span class="button-label">ok</span>
        </button>
        <button class="bookmark-item-delete js-item-delete">
          <span class="button-label">delete</span>
        </button>
      
    `;
  if (!item.expanded) {
    itemTitle = 
    `<div class="bookmark-box">
    <button class="bookmark-item bookmark-item__expanded">${item.title}</button>
    <div class="rating-box">${ratingLabel(item)}</div>
    </div> `;
    
  }

  return `
    <li class="js-item-element" data-item-id="${item.id}">
      ${itemTitle}
      
      
    </li>`;
};

const generatebookmarkItemsString = function (bookmarksList) {
  const items = bookmarksList.map((item) => generateItemElement(item));
  return items.join('');
};

const generateError = function (message) {
  return `
  <section class = "error-content">
    <button id = "cancel-error">X</button>
    <p>${message}</p>
    </section>
    `;
};

const renderError = function (){
  if (store.error) {
    const el = generateError(store.error);
    $('.error-container').html(el);
  } else {
    $('.error-container').empty();
  }
};

const handleCloseError = function (){
  $('.main-view').on('click', '#cancel-error', () => {
    store.setError(null);
    renderError();
  });
};
//---template generation functions---//
function generateBookmarkForm () {
  return ` 
  <div class="error-container"> </div>
  <form id="js-new-bookmark-form">
  
  <label>Add New Bookmark:<br>
  
  <input type="text" name="url" class="bookmark-url-entry" placeholder="http(s)://" required><br>
  </label>
  <label>Bookmark Title:<br>
  <input type="text" name="title" class="bookmark-title-entry" placeholder="max of 15 characters" maxlength="15" required>
  </label>
  <br>
  <label>Rating (1-5 stars):<br></label>
  <div class="txt-center">
        <div class="rating">
        
    
            <label>
            <input id="star5" name="rating" type="radio" value="5" class="starRadio" />
            5</label>
            <label>
            <input id="star4" name="rating" type="radio" value="4" class="starRadio" />
            4</label>
            <label>
            <input id="star3" name="rating" type="radio" value="3" class="starRadio" />
            3</label>
            <label>
            <input id="star2" name="rating" type="radio" value="2" class="starRadio" />
            2</label>
            <label>
            <input id="star1" name="rating" type="radio" value="1" class="starRadio" />
            1</label>
           
        </div>
 
</div>

<input type="text" name="desc" class="bookmark-description-entry" placeholder="description"><br>
  <button class="create" type="submit">create</button>
  <button class="cancel" type="reset">cancel</button>
</form>`
}
function startForm(){
  return `<div class="new-bookmark-form"> </div>
  <div class = "my-bookmarks-view">
  <header>
<h2>My Bookmarks</h2>
<form id="initial-view">
<button class="initial-view-new">
<span class="button-label">New</span>
</button>
<label value="drop-down"><select id="ratings" name="ratings">
  <option> <span class="button-label"></span>Filter By</span></option>
  <option value="1">1 star</option>
  <option value="2">2 stars</option>
  <option value="3">3 stars</option>
  <option value="4">4 stars</option>
  <option value="5">5 stars</option>
</select>
</label>
</form>
</header>
<ul class="bookmark-list js-bookmark-list"></ul>
  </div>`
}

//----RENDER FUNCTION---//

const render = function () {
  renderError();
  // Filter item list by item rating 
  let items = [...store.bookmarks];
  
   items = items.filter(item => item.rating >= store.filter);
  

  // render the bookmark list in the DOM
  const bookmarkListItemsString = generatebookmarkItemsString(items);

  // insert that HTML into the DOM
  if (store.adding == false){
    let html = startForm();
    $(".main-view").html(html)
  $('.js-bookmark-list').html(bookmarkListItemsString);
  } else {
    $(".my-bookmarks-view").empty()
  }
};
/*function serializeJson(form) {
    const formData = new FormData(form);
    const o = {};
    formData.forEach((val, name) => o[name] = val);
    return JSON.stringify(o);
  }
 */ 
$.fn.extend({
    serializeJson: function() {
      const formData = new FormData(this[0]);
      const o = {};
      formData.forEach((val, name) => o[name] = val);
      return JSON.stringify(o);
    }
  });

const handleNewItemSubmit = function () {
  $('.main-view').on("submit", "#js-new-bookmark-form", event => {
     
    event.preventDefault();
  
    const bookmark = $(event.target).serializeJson();

    api.createItem(bookmark)
    
    .then((bookmark)=> {
    store.addItem(bookmark);
    store.adding = false;
    store.filter = 0;
    addNewForm()
    render();
  })
  .catch((error) => {
    store.setError(error.message);
    renderError();
  });
 
  
})

};

const getItemIdFromElement = function (item) {
  return $(item)
    .closest('.js-item-element')
    .data('item-id');
};

const handleDeleteItemClicked = function () {

  $(".main-view").on('click', '.js-item-delete', event => {
    // get the index of the item in store.items
    const id = getItemIdFromElement(event.currentTarget);
    // delete the item
    api.deleteItem(id)
    .then(()=> {
    store.findAndDelete(id);

    // render the updated bookmark list
    render();
    })
    .catch((error) => {
      
      store.setError(error.message);
      renderError();
    })
  });
};

const handleItemExpandClicked = function () {
  $('.main-view').on('click', '.bookmark-item__expanded', event => {

    const id = getItemIdFromElement(event.currentTarget);
    const item = store.findById(id);
    item.expanded = !item.expanded
 
    render();
    
    
  });
};

const handleOkClicked = function () {
  $('.main-view').on('click', '.js-item-toggle', event => {
  const id = getItemIdFromElement(event.currentTarget);
  const item = store.findById(id);
  item.expanded = !item.expanded
  render()
  });
};


const handleFilterClick = function (){

  let filterValue = $("#ratings option:selected").val();
  store.filter = filterValue;

render()
  
}


const handleNewCancel = function (){
  $(".main-view").on("click", ".cancel", function(){
    event.preventDefault();
   
    store.adding = false
    
    addNewForm();
    render();
  })
}
const handleNewSubmit = function (){

  $(".main-view").on("click", ".initial-view-new", function(){
    event.preventDefault();
    console.log("clicked new");
    store.adding = true

    addNewForm();
  })
}
const addNewForm = function (){
  if(store.adding){
  const html = generateBookmarkForm()
  
  $(".new-bookmark-form").html(html)
  
  } else {
    $(".new-bookmark-form").empty()
  }
  render();
}


const bindEventListeners = function () {
  handleNewItemSubmit();
  handleItemExpandClicked();
  handleDeleteItemClicked();
  //handleEditbookmarkItemSubmit();
  handleCloseError();
  $(".main-view").on('change','#ratings', handleFilterClick);
  handleNewSubmit();
  handleNewCancel();
  handleOkClicked();
};
// This object contains the only exposed methods from this module:
export default {
  render,
  bindEventListeners
};