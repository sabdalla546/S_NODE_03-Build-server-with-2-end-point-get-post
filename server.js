 const http = require('http');
 const groupWithCategory =(product)=>{
    const categorized={};
    product.forEach(element => {
        if(categorized[element.category.id]){
            categorized[element.category.id].product.push(element);
        }else {
            categorized[element.category.id]={
                category:{
                    id:element.category.id,
                    name:element.category.name,
                },
                product:[element]
            };
        }
    });
    return Object.values(categorized);
}
const transferCurrency = (products, rate) => {
    return products.map((el) => ({ ...el, price: el.price * rate }));
  };
const fetchData=(url)=>fetch(url).then(res=>res.json());

const categorizeProducts  = async(rateType)=>{
    const [products, rate] = await Promise.all([
        fetchData("https://api.escuelajs.co/api/v1/products?offset=1&limit=10"),
        fetchData("https://api.exchangerate.host/latest?base=USD").then(
          (res) => res.rates[rateType]
        ),
      ]);
      const transformedPrices = transferCurrency(products, rate);  
      const result=groupWithCategory(transformedPrices);
    return result;
}
//categorizeProducts('EGP');
 const addProductPostRequest= async(data)=>{
    const res= await fetch('https://api.escuelajs.co/api/v1/products/',{
        method: "POST",
        body:JSON.stringify(data),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    const result=await res.json();
    return result;
}

 const server =http.createServer((req,res)=>{
    //console.log(req.method,req.url);
    const method= req.method;
    const url = req.url;
    if(method=="GET"){
        (async () => {
            res.setHeader('content-type','application/json');
            const finalResult=await categorizeProducts(`${req.url.split('/').at(-1)}`)
            res.end(JSON.stringify(finalResult));
          })()
       
    }else if (method=="POST" && url === "/"){
        let cuncks = [];
        
        req.on('data',cunck=>{
            cuncks.push(cunck);
        }).on('end',()=>{
            res.setHeader('content-type','application/json');
            (async () => {
                let productInfo=await addProductPostRequest(JSON.parse(cuncks.toString()));
                res.end(JSON.stringify(productInfo));
              })()
        }).on('error',(error)=>{
            res.setHeader('content-type','text');
            res.writeHead(500);
            res.write(error.message);
        });
    }else{
        res.end('done');
    }
   
 });

 server.listen(3000,'localhost',()=>{
    console.log('server is runing in port 3000');
 });
