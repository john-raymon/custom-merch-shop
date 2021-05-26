import { useEffect } from 'react';

export default function OrderStepForm(props) { 

  return (
    <form className="w-full h-full">
      {/* // all steps go in here */}
      <div className="flex w-full">
        <div className="flex h-full w-1/2">
          <p className="w-3/4 font-quest text-6xl text-left">
            Choose a product to design
          </p>
        </div>
        <div className="flex w-1/2">
          <ul className="space-y-6 w-full">
            {
              Object.values(props.productsById).map((product) => {
                return (
                  <li key={product.id + product.variant_count} className="flex flex-row space-x-6 border-b">
                    <div className="self-center">
                      <input name="product-type" type="radio" />
                      {/* <label for="huey">s</label> */}
                    </div>
                    <div>
                      <img src={product.image} className="object-cover h-24 w-1/2" />
                    </div>
                  </li>
                );
              })
            }
          </ul>
          <button>
            
          </button>
        </div>
      </div>
    </form>
  )
}
