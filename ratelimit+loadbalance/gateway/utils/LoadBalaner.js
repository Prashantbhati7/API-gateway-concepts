
const counter = {
    '/orders':0,
    '/auth':0,
    '/products':0   
};

const LoadBalancer = (route)=>{
    const totalTargets = route.target.length;
    const targetIndex = (counter[route.prefix] || 0) % totalTargets;
    counter[route.prefix] = (counter[route.prefix] || 0) + 1;
    return targetIndex;
}

export default LoadBalancer;