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
        <div className="flex flex-col w-1/2">
          <ul className="space-y-6 w-full overflow-y-scroll h-96">
            {
              Object.values(props.productsById).map((product) => {
                const key = product.id + product.variant_count;
                return (
                  <li key={key} className="flex flex-row space-x-6 border-b">
                    <div className="self-center">
                      <input name="product-type" type="radio" />
                      {/* <label for="huey">s</label> */}
                    </div>
                    <div className="flex flex-grow justify-between items-center">
                      <p className="font-quest text-xl pr-4 text-left">{product.model}</p>
                      <img src={product.image} className="object-cover h-24 w-1/3" />
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
