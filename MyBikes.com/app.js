//1.set variables:
//menu
const menu = document.querySelector(".menu-list");
const menuBtn = document.querySelector(".menu-btn");
const cancelBtn = document.querySelector(".cancel-btn");
//cart
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const shopNow = document.getElementsByClassName('.banner-btn'); //?? from banner-btn => section.products
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const btns = document.querySelectorAll('.bag-btn');

//cart
let cart = [];
//buttons
let buttonsDOM = [];

//class for getting the products
class Products {
    async getProducts() { //async always return a promice."await" -when the promice is settled and return result
       try {
          let result = await fetch('products.json');
          let data = await result.json(); //data in json format

          let products = data.items;
          products = products.map(item => {
             const { title, price } = item.fields;
             const { id } = item.sys;
             const image = item.fields.image.fields.file.url;

             return { title, price, id, image };
          });

          return products;

       } catch (error) {
             console.log(error);
       }
    }
}

//UI class - display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
                     <!-- single product -->
                     <article class="product">
                        <div class="img-container">
                            <img src="${product.image}" alt="product" class="product-img">
                            <button class="bag-btn" data-id=${product.id}>
                                <i class="fas fa-shopping-cart"></i>add to cart
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                     </article>
                     <!-- end of single product -->
                    `;
        });
        //add it to product-center div
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]; //turn it to an array
        buttonsDOM = buttons;
        //for each button....:
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id); //check if item id match the button id
            //check if item is already in cart:
            if(inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
           
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                //get product from products:
                let cartItem = {...Storage.getProduct(id), amount:1}; //id from dataset

                //add product to cart(array)
                //...cart- get all items in the cart, cartItem - added to cart
                cart = [...cart, cartItem];

                //save cart in local storage
                Storage.saveCart(cart);

                //set cart values
                this.setCartValues(cart);

                //display cart item
                this.addCartItem(cartItem);

                //show the cart
                this.showCart();
            });
        });
    };

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
                         <img src="${item.image}" alt="product">
                            <div>
                              <h4>${item.title}</h4>
                              <h5>$${item.price}</h5>
                              <span class="remove-item" data-id=${item.id}>remove</span>
                            </div>
                            <div>
                               <i class="fas fa-chevron-up" data-id=${item.id}></i> 
                               <p class="item-amount">${item.amount}</p>
                               <i class="fas fa-chevron-down" data-id=${item.id}></i>
                             </div>   
                        `;
        cartContent.appendChild(div);
    }
    //show and hide cart
    showCart() {
       cartOverlay.classList.add('transparentBcg');
       cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    setupAPP() {
       cart = Storage.getCart(); //values of cart
       this.setCartValues(cart);
       this.populateCart(cart);
       cartBtn.addEventListener('click', this.showCart);

       closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        //clear cart
        clearCartBtn.addEventListener('click', () => {
           this.clearCart();
        });

        //cart functionality
        cartContent.addEventListener('click', event => {
           if (event.target.classList.contains('remove-item')) {
               let removeItem = event.target;
               let id = removeItem.dataset.id;
               cartContent.removeChild(removeItem.parentElement.parentElement)
               this.removeItem(id);
           } else if (event.target.classList.contains("fa-chevron-up")) {
               let addAmount = event.target;
               let id = addAmount.dataset.id;
               let tempItem = cart.find(item => item.id === id);
               tempItem.amount = tempItem.amount + 1;
               Storage.saveCart(cart);
               this.setCartValues(cart);
               addAmount.nextElementSibling.innerText = tempItem.amount;
           } else if (event.target.classList.contains("fa-chevron-down")) {
               let lowerAmount = event.target;
               let id = lowerAmount.dataset.id;
               let tempItem = cart.find(item => item.id === id);
               tempItem.amount = tempItem.amount -1;
               if (tempItem.amount > 0) {
                   Storage.saveCart(cart);
                   this.setCartValues(cart);
                   lowerAmount.previousElementSibling.innerText = tempItem.amount;
               } else {
                   cartContent.removeChild(lowerAmount.parentElement);
                   this.removeItem(id);
               }
           }
        });
    }

    clearCart() {
        //get all ids of the items in cart
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    };

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        //clear cart values(total sum)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}

//local storage class
class Storage {
    //static method - we can use it without instantiate the class (class Storage)!!
    static saveProducts(products) { //products- parameter-not products array
        localStorage.setItem("products", JSON.stringify(products)); //stringify-save it as string
    }

    static getProduct(id) { //return array in local storage
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ?
               JSON.parse(localStorage.getItem('cart')) : [];
        //check if item exist(if not return empty array)
    }
}

//eventListener for click
document.addEventListener("DOMContentLoaded", () => {
    //create new instances
    const ui = new UI();
    const products = new Products();

    //setup app
    ui.setupAPP();

    //get all products
    products.getProducts()
            .then(products => { //console.log(products)
            ui.displayProducts(products)
        Storage.saveProducts(products);  
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});
//hide and show menu        
menuBtn.addEventListener('click', () => {
    menu.classList.add("active");
    menuBtn.classList.add("hide");
});     
cancelBtn.addEventListener('click', () => {
    menu.classList.remove("active");
    menuBtn.classList.remove("hide");
});   
//shopNow.addEventListener('click', displayProducts());//????
