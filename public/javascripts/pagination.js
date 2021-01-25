let max_entries_per_page = 5;
let pageIndexes = [];
let pageLinksElement = '';
let book_entries = document.querySelector('tbody').childNodes;
let pagesNeeded = Math.ceil(book_entries.length / max_entries_per_page);
console.log("Pages Needed: " + pagesNeeded);

function createPages(){
    //checking if ul pagination links already exist, removing them if they do
    var linkCheck = document.getElementsByClassName('pagination');
    if(linkCheck.length > 0){
        pageElement.removeChild(pageLinksElement);
    }
    //create new ul pagination element
    pageLinksElement = document.createElement('ul');
    pageLinksElement.className = 'pagination';
    let pageIndex = 0;

    for(let i=0; i < pagesNeeded; i++){
        //add current index to the pageIndexes array, then increment by max 
        pageIndexes.push(pageIndex);
        pageIndex += max_entries_per_page;
        let pageLink = document.createElement('li');
        pageLink.innerHTML = `<a>${i+1}</a>`;
        pageLink.addEventListener("click", (e) =>{showPage(book_entries, i);});
        pageLinksElement.appendChild(pageLink);
    }
    let page_display = document.querySelector(".pageDisplay");
    let table = document.querySelector("table");
    page_display.insertBefore(pageLinksElement, table);
}

function showPage(books, page){
    
    //show only books from the array passed in
    for(let i = 0; i < books.length; i++){
        if(i >= pageIndexes[page] && i < (pageIndexes[page]+max_entries_per_page)){
            //show
            books[i].style.display = "";
        }else{
            //hide
            books[i].style.display = "none";
        }
    }
}

createPages();
showPage(book_entries, 0);
