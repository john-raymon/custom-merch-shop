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
  const [productsById, updateProducts] = useState({ ...props.productsById })
  async function fetchProductsVariants(productId) {
    if (productsById[productId].variants) {
      return;
    }
    const res = await fetch(`api/products/${productId}`);
    const data = await res.json();
    updateProducts({ ...productsById, [productId]: {...productsById[productId], variants: data.variants }})
  };
  function handleLastSelectedColorChange(productId, color) {
    // reset selected product variant since a change of product color resets the last selected size too
    // hence invalidaing the last set selectedProductVariant object
    setSelectedProductVariant(null);

    updateProducts({ ...productsById, [productId]: {...productsById[productId], lastSelectedColor: color, lastSelectedSize: '' }})
  }
  const [selectedProductVariant, setSelectedProductVariant] = useState(null);
  function handleLastSelectedSizeChange(productId, color, size) {
    setSelectedProductVariant(productsById[productId].variants[color][size]);
    updateProducts({
      ...productsById,
      [productId]: {
        ...productsById[productId], 
        lastSelectedSize: size,
      },
    })
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
              Object.values(productsById).map((product) => {
                const key = product.id + product.variant_count;
                const isProductSelected = parseInt(selectedProduct) === parseInt(product.id);
                return (
                  <li key={key} tabIndex="1" className="outline-none">
                    <div className="flex flex-row space-x-6 border-b">
                      <div className="self-center pl-1">
                        <input className="cursor-pointer" name="product-type" value={product.id} type="radio" onChange={handleProductChange} checked={isProductSelected} tabIndex="1"/>
                        {/* <label for="huey">s</label> */}
                      </div>
                      <div className="flex flex-grow justify-between items-center">
                        <p className="font-quest text-xl pr-4 text-left">{product.model}</p>
                        <img src={product.image} className="object-cover h-24 w-1/3 rounded-tl-md rounded-tr-md" />
                      </div>
                    </div>
                    { 
                      (isProductSelected && productsById[product.id].variants) ?
                      <div className="w-full space-y-2 my-3">
                        <div className="w-full flex flex-row items-center space-x-3">
                          <p className="font-quest text-base">
                            Choose a color for your item.
                          </p>
                          <ul className="flex flex-row space-x-2">
                            {
                             Object.keys(product.variants).map((color) => {
                              return (
                                <li key={color} className="w-7 h-7 relative">
                                  <div className="w-full h-full rounded-full pointer" style={{ background: Object.values(product.variants[color])[0].color_code }} />
                                  <input 
                                    className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer" 
                                    type="radio" 
                                    name="variant-color-selected" 
                                    value={color} 
                                    onChange={() => handleLastSelectedColorChange(product.id, color)}
                                    tabIndex="1"
                                  />  
                                </li>
                              )
                             })
                            }
                          </ul>
                        </div>
                        <div className="w-full flex flex-row items-center space-x-3">
                          <p className="font-quest text-base">
                            Choose a size for your item.
                          </p>
                          <ul className="flex flex-row space-x-2">
                            <select className="text-gray-700 font-quest text-base" value={productsById[product.id].lastSelectedSize || ''} onChange={(e) => handleLastSelectedSizeChange(product.id, productsById[product.id].lastSelectedColor, e.target.value)}>
                                <option value="" disabled>{ !productsById[product.id].lastSelectedColor ? 'Select a color above first' : 'Select a size'}</option>
                                {
                                  Object.keys(productsById[product.id].lastSelectedColor ? productsById[product.id].variants[productsById[product.id].lastSelectedColor] : []).map((size) => {
                                    return (
                                      <option value={size} key={size}>{size}</option>
                                    )
                                  })
                                }
                            </select>
                            {/* {
                             Object.keys(product.variants).map((color) => {
                              return (
                                <li key={color}>
                                  <div className="w-7 h-7 rounded-full" style={{ background: product.variants[color].color_code }} />
                                </li>
                              )
                             })
                            } */}
                          </ul>
                        </div>
                      </div>
                      : ''
                    }
                  </li>
                );
              })
            }
          </ul>
          <button disabled={selectedProductVariant ? false : true} className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-16 outline-none">
            Start designing your item
          </button>
        </div>
      </div>
    </form>
  )
}
