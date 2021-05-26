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
          <ul>
            <li>
              <div>
                <input name="product-type" type="radio" />
                {/* <label for="huey">s</label> */}
              </div>
            </li>
            <li>
              <div>
                <input name="product-type" type="radio" />
              </div>
            </li>
            <li>
              <div>
                <input name="product-type" type="radio" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </form>
  )
}
