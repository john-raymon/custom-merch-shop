import { useEffect, useState } from 'react';

export default function OrderStepForm(props) { 
  const [selectedProduct, setProduct] = useState("");
  const handleProductChange = (e) => {
    setProduct(e.target.value);
    fetchProductsVariants(e.target.value);
  }
  // fetchProductsVariants has to fetch the color and size variants for the given product id
  // and reduce the array to a dictionary mapping the colors to a list of sizes for the color 
  // (filter out US supplier-out-of-stock sizes will be included -> availability_status)
  async function fetchProductsVariants(productId) {
    const res = await fetch(`api/products/${productId}`);
    const data = await res.json();
    debugger;
  };
  return (
    <form className="w-full h-full">
      {/* // all steps go in here */}
      <div className="flex w-full">
        <div className="flex h-full w-1/2">
          <p className="w-3/4 font-quest text-6xl text-left">
            Choose a product to design
          </p>
        </div>
        <div className="flex flex-col w-1/2">
          <ul className="space-y-6 w-full overflow-y-scroll h-96">
            {
              Object.values(props.productsById).map((product) => {
                const key = product.id + product.variant_count;
                return (
                  <li key={key} className="flex flex-row space-x-6 border-b">
                    <div className="self-center">
                      <input name="product-type" value={product.id} type="radio" onChange={handleProductChange} checked={parseInt(selectedProduct) === parseInt(product.id)} />
                      {/* <label for="huey">s</label> */}
                    </div>
                    <div className="flex flex-grow justify-between items-center">
                      <p className="font-quest text-xl pr-4 text-left">{product.model}</p>
                      <img src={product.image} className="object-cover h-24 w-1/3 rounded-tl-md rounded-tr-md" />
                    </div>
                  </li>
                );
              })
            }
          </ul>
          <button className="w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-16 outline-none">
            Start designing your item
          </button>
        </div>
      </div>
    </form>
  )
}
