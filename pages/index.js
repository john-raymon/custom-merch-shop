import Head from 'next/head'
import OrderStepForm from './../components/OrderStepsForm';

export default function Home(props) {
  return (
    <div className="w-full p-12 md:p-36 flex h-screen items-center justify-center">
      <OrderStepForm productsById={props.productsById} />
    </div>
  )
}
// TODO : move serverSide data fetching logic to respective step
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch('https://api.printful.com/products', {
    headers: new Headers({
      "Authorization": `Basic ${Buffer.from(`${process.env.PRINTFUL_API_KEY}:`).toString('base64')}`
    }),
  })
  const data = await res.json()
  const productIdsToInclude = [5, 10, 11]
  const products = data.result.reduce((acc, curr) => {
    if (!productIdsToInclude.includes(curr.id)) {
      return acc;
    }
    acc[curr.id] = curr;
    return acc;
  }, {});
  // Pass data to the page via props
  return { props: { productsById: products } }
}

