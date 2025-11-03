const Device = require('./models/Device');

/*const simulateMovement = async () => {
    const devices = await Device.find({status: "active"});

    for (const device of devices) {
        const latDrift = (Math.random() - 0.5) * 0.0002;
        const lngDrift = (Math.random() - 0.5) * 0.0002;
        const newLat = device.latitude + latDrift;
        const newLng = device.longitude + lngDrift;
        const newSpeed = Math.max(0, device.speed + (Math.random() - 0.5) * 10);
        const newDirection = (device.direction + Math.floor(Math.random() * 10)) % 360;
        const newTimestamp = new Date();
    
        await Device.findByIdAndUpdate(device._id, {
          latitude: newLat,
          longitude: newLng,
          speed: newSpeed,
          direction: newDirection,
          timestamp: newTimestamp,
        });
      }
    };

    module.exports = simulateMovement;*/
    const startPoint = { lat: 3.110972, lng: 101.583055 };
    const endPoint = {lat: 3.110287, lng: 101.584575};

    const TOTAL_STEPS = 50;

    let currentStep = 0;

    const simulateMovement = async () => {
      const devices = await Device.find({status: "active"});

      for (const device of devices){
        if (currentStep > TOTAL_STEPS){
          console.log('Device ${device.id} reached destination');
          continue;
        }
    
    const newLat =
      startPoint.lat +
      ((endPoint.lat - startPoint.lat) * currentStep) / TOTAL_STEPS;
    const newLng =
      startPoint.lng +
      ((endPoint.lng - startPoint.lng) * currentStep) / TOTAL_STEPS;

    const newSpeed = 10; // constant or you can vary slightly
    const newDirection = 90; // eastward, just example
    const newTimestamp = new Date();

    await Device.findByIdAndUpdate(device._id, {
      latitude: newLat,
      longitude: newLng,
      speed: newSpeed,
      direction: newDirection,
      timestamp: newTimestamp,
    });

    console.log(
      `Step ${currentStep}: Device ${device.id} moved to ${newLat}, ${newLng}`
    );
  }

  currentStep++;
};

module.exports = simulateMovement;