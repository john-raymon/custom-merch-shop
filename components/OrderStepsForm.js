import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function StepTwo(props) {
  return (
    <div className="w-full">
      <div className="w-full flex justify-between space-x-1">
          <button onClick={props.prevStep} className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-16 outline-none">
            Prev
          </button>
          <button className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-16 outline-none">
            Next
          </button>
      </div>
    </div>
  )
}

function StepOne(props) {
  const [selectedProduct, setProduct] = useState("");
  const [selectedProductVariant, setSelectedProductVariant] = useState(null);
  const [productsById, updateProducts] = useState({ ...props.productsById })
  useEffect(() => {
    if (props.productVariant) {
      handleProductChange(null, props.productVariant.product_id);
    }
  }, [])
  useEffect(() => {
    // this handles, reselecting the last selected product variant's product, color, and size when returning back to this step.
    // this may have been better https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
    if (props.productVariant && props.productVariant.product_id === selectedProduct && productsById[selectedProduct].variants && (!productsById[selectedProduct].lastSelectedSize && !productsById[selectedProduct].lastSelectedColor)) {
      const color = props.productVariant.color;
      const size = props.productVariant.size;
      updateProducts({ ...productsById, [selectedProduct]: {...productsById[selectedProduct], lastSelectedColor: color, lastSelectedSize: size }})
      setSelectedProductVariant(props.productVariant);
    }
  }, [productsById])
  const handleProductChange = (e = null, productId) => {
    const id = e ? e.target.value : productId;
    setProduct(id);
    fetchProductsVariants(id);
  }
  // fetchProductsVariants has to fetch the color and size variants for the given product id
  async function fetchProductsVariants(productId) {
    if (selectedProductVariant) {
      setSelectedProductVariant(null);
    }
    if (productsById[productId].variants) {
      const color = productsById[productId].lastSelectedColor;
      const size = productsById[productId].lastSelectedSize;
      if (color && size) {
        setSelectedProductVariant(productsById[productId].variants[color][size]);
      }
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
    // reset last selected size, since there are different sizes for each color
    updateProducts({ ...productsById, [productId]: {...productsById[productId], lastSelectedColor: color, lastSelectedSize: '' }})
  }
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
  function validateThenSubmitNext(e) {
    e.preventDefault();
    // valid if there is a selectedProductVariant object
    if (selectedProductVariant) {
      props.handleNextSubmit(selectedProductVariant);
    }
  }
  return (
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
        <button onClick={validateThenSubmitNext} disabled={selectedProductVariant ? false : true} className="disabled:opacity-50 w-full md:w-2/5 font-quest text-white text-md bg-black p-4 self-end my-16 outline-none">
          Start designing your item
        </button>
      </div>
    </div>
  );
}

export default function OrderStepForm(props) { 
  const [productVariant, setProductVariant] = useState(null);
  const router = useRouter();
  // go to previous step
  function prevStep(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (props.currentStep > 1) {
      router.push(`/${props.currentStep - 1}`)
      // setSteps({ ...steps, currentStep: props.currentStep - 1});
    }
  }
  // for last step instead of calling nextStep call submitForm method
  function nextStep() {
    if (props.currentStep < 3) {
      router.push(`/${props.currentStep + 1}`)
      // setSteps({...steps, currentStep: props.currentStep + 1})
    }
  }

  function renderSwitchSteps(step) {
    switch (parseInt(step)) {
      case 1:
        return (<StepOne productsById={props.productsById} handleNextSubmit={(productVariant) => { setProductVariant(productVariant); nextStep(); }} productVariant={productVariant} />);
        break;
      case 2:
        return (<StepTwo prevStep={prevStep}></StepTwo>);
      default:
        break;
    }
  }
  return (
    <form className="w-full h-full">
      {
        renderSwitchSteps(props.currentStep)
      }
    </form>
  )
}