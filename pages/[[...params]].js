import { useRouter } from 'next/router';
import Head from 'next/head'
import OrderStepForm from '../components/OrderStepsForm';


export default function Home(props) {
  const router = useRouter();
  const [currentStep] = router.query.params || [1];
  return (
    <div className="w-full px-24 my-12 h-full">
      <OrderStepForm productsById={props.productsById} currentStep={parseInt(currentStep)} />
    </div>
  )
}
// TODO : move serverSide data fetching logic to respective step
export async function getServerSideProps(context) {
  const [currentStep] = context.params.params || [1];
  if (currentStep > 1) {
    return { props: {} };
  }
  const res = await fetch('https://api.printful.com/products', {
    headers: new Headers({
      "Authorization": `Basic ${Buffer.from(`${process.env.PRINTFUL_API_KEY}:`).toString('base64')}`
    }),
  });
  const data = await res.json();
  const productIdsToInclude = [5]; // 10 11
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

