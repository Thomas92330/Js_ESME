//Global Variable-------------------------------------------------------------------------------------------------------
let argentGagne = 0;
let CurrentOffer = {
    pricePerBox: 0,
    boxes: 0,
    travel: 0
};
let truckList = [
    {id:"0" , available:"True" , speed:Math.random() * 50 + 50 , capacity:Math.random() * 90 + 10},
    {id:"1" , available:"True" , speed:Math.random() * 50 + 50 , capacity:Math.random() * 90 + 10},
    {id:"2" , available:"True" , speed:Math.random() * 50 + 50 , capacity:Math.random() * 90 + 10},
    {id:"3" , available:"True" , speed:Math.random() * 50 + 50 , capacity:Math.random() * 90 + 10},
];
//Constantes------------------------------------------------------------------------------------------------------------
const R = require('ramda');

const oilPricePerDistance = 100;

const returnLater = (char, timer) =>
    new Promise(resolve => setTimeout(() => resolve(char), timer));

const ReAvailableTruck = async(timer) => {
    await returnLater('truck', timer);
}

const calculProfitability = (offer,numberOfAvailableTruck) =>{
    return( (offer.pricePerBox*offer.boxes)/(offer.travel/numberOfAvailableTruck) );
}

const gagnerArgent = (offer) =>{
    return(offer.pricePerBox * offer.boxes)-(offer.travel/oilPricePerDistance) ;
}

const setNumberOfAvailableTruck = () =>{
    let numberOfAvailableTruck=0;
    truckList.map(truck => {
        if (truck.available === "True") {
            numberOfAvailableTruck++;
        }
    })
    return numberOfAvailableTruck;
}

const SetNumberOfTrucks = (argentGagne % 500) + 4;

const setTimer = (offer,currentTruckId) =>{
    return offer.travel * truckList[currentTruckId].speed;
}

const buyTruck = () =>{
    console.log("\nWe currently have " + String(Math.round(argentGagne)) + " euros");
    if (argentGagne > 500 ){
        console.log("Which is enough to buy a new truck");
        truck_emitter();
        argentGagne -= 500;
        console.log("This is the characteristics of our new truck : speed = " + String( Math.round(truckList[truckList.length-1].speed) ) + " capacity = " + String ( Math.round(truckList[truckList.length-1].capacity))  );
    }
    else{
        console.log("Which is not enough to buy a new truck");
    }
}

const isAvailable = R.filter(truck => truck.available === 'True');
const HasEnoughCapacity = R.reject(truck => truck.capacity <= CurrentOffer.boxes);
const getIdOfTruck  =
    R.pipe(
        isAvailable,
        HasEnoughCapacity,
        R.any(truck => truck.id),
        Math.max
    )(truckList);

//Controller ----------------------------------------------------------------------------------------------------------
const TruckManager = (offer) => {
    CurrentOffer = offer;
    buyTruck();
    let currentTruckId = getIdOfTruck;
    console.log("Offer for " + String(offer.boxes) + " boxes at " + String(offer.pricePerBox) +
        " euros each, with " + String(offer.travel) + " of travel time");
    if(isNaN(currentTruckId)) {
        console.log("We can't handle this offer");
    }
    else if (calculProfitability(offer, setNumberOfAvailableTruck()) > 0.5) {
        truckList[currentTruckId].available = "False";
        console.log("Truck " + currentTruckId + " send.");
        ReAvailableTruck(setTimer(offer,currentTruckId)).then(() => {
            truckList[currentTruckId].available = "True";
            argentGagne += gagnerArgent(offer);
            console.log("Truck " + currentTruckId + " returned.");
        });
    }
    else {
        console.log("The profitability of this offer is insufficient ");
    }

}


//Emitter -------------------------------------------------------------------------------------------------------------
const marketEvent = new (require('events').EventEmitter)();

const truck_emitter = () => {
    marketEvent.emit('New Truck', {
        id:SetNumberOfTrucks-1 ,
        available:"True" ,
        speed:Math.random() * 50 + 50 ,
        capacity:Math.random() * 90 + 10
    });
}

const emitter_ = () => {
    marketEvent.emit('New Offer', {
        pricePerBox: Math.ceil(Math.random() * 10),
        boxes: Math.floor(Math.random() * 100),
        travel: Math.floor(Math.random() * 1000)
    });
};

const launchEmitter = () => {
    emitter_();
    setTimeout(launchEmitter, Math.random() * 10000);
};

marketEvent.on('New Offer', offer => TruckManager(offer));
marketEvent.on('New Truck', newTruck => truckList.push(newTruck));
launchEmitter();

module.exports = {launchEmitter, marketEvent};
