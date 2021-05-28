// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import nc from 'next-connect'
import onError from '../../../middleware/onError';

const handler = nc({
  onError 
});

export default handler
  .get(async (req, res, next) => {
    const { productId } = req.query;
    // Fetch data from external API
    const fetchRes = await fetch(`https://api.printful.com/products/${productId}`, {
      headers: new Headers({
        "Authorization": `Basic ${Buffer.from(`${process.env.PRINTFUL_API_KEY}:`).toString('base64')}`
      }),
    });
    const data = await fetchRes.json();
    const variants = data.result.variants.reduce((acc, variant) => {
      // only include variants that are in stock in the US region.
      if (variant.availability_status[0].status !== 'in_stock') {
        return acc;
      }
      acc[variant.color] = {...(acc[variant.color] || {}), [variant.size]: variant };
      return acc;
    }, {});
    return res.json({ variants })
  });