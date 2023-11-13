document.getElementById('solar-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Helper function to parse and validate numbers
    function parseAndValidateNumber(input) {
        const parsed = parseFloat(input);
        return isNaN(parsed) ? null : parsed;
    }

    // Get user input
    const purpose = document.getElementById('purpose').value;
    const systemType = document.getElementById('system-type').value;
    const monthlyBill = parseAndValidateNumber(document.getElementById('monthly-bill').value);
    const space = parseAndValidateNumber(document.getElementById('space').value);
    const budget = parseAndValidateNumber(document.getElementById('budget').value);
    const backupDays = parseAndValidateNumber(document.getElementById('backup-days').value);
    const peakSunlightHours = parseAndValidateNumber(document.getElementById('peak-sunlight-hours').value);
    const netMetering = document.getElementById('netmetering').checked;

    if (!backupDays || backupDays <= 0) {
        outputDiv.innerHTML = 'Please enter a valid backup days value.';
        return;
    }
    if (!peakSunlightHours || peakSunlightHours <= 0) {
        outputDiv.innerHTML = 'Please enter a valid peak sunlight hours value.';
        return;
    }

    // For netMetering
    var netMeteringCost = 0;
    if (netMetering) {
        netMeteringCost = 100000;  // PKR 100,000 for net metering
    }

    var totalCost = installationCost + batteryCost + netMeteringCost;

    // Validate input and provide feedback
    const outputDiv = document.getElementById('estimation-output');
    if (!monthlyBill || monthlyBill <= 0) {
        outputDiv.innerHTML = 'Please enter a valid monthly electricity bill.';
        return;
    }
    if (!space || space <= 0) {
        outputDiv.innerHTML = 'Please enter a valid space value.';
        return;
    }
    if (!budget || budget <= 0) {
        outputDiv.innerHTML = 'Please enter a valid budget value.';
        return;
    }

    // Get battery type input
    const batteryElement = document.getElementById('battery-type');
    const batteryType = batteryElement ? batteryElement.value : null;
    if (!batteryType) {
        outputDiv.innerHTML = 'Please select a valid battery type.';
        return;
    }


    // Get the price per unit (kWh) from user input
    var pricePerUnit = parseAndValidateNumber(document.getElementById('price-per-unit').value);
    if (pricePerUnit === null || pricePerUnit <= 0) {
        outputDiv.innerHTML = 'Please enter a valid price per unit (kWh).';
        return;
    }
    var monthlyConsumption = monthlyBill / pricePerUnit;

    // Logging intermediate results for debugging
    console.log("Purpose:", purpose);
    console.log("System Type:", systemType);
    console.log("Monthly Bill:", monthlyBill);
    console.log("Space:", space);
    console.log("Budget:", budget);
    console.log("Battery Type:", batteryType);
    console.log("Monthly Consumption:", monthlyConsumption);


    var requiredSystemSize = monthlyConsumption / (30 * peakSunlightHours);
    // Logging more intermediate results for debugging
    console.log("Required System Size:", requiredSystemSize);


    var recommendedSystemSize, pricePerWatt;
    if (space) {
        var maxPossibleSystemSize = getMaxPossibleSystemSize(space);
        recommendedSystemSize = Math.min(requiredSystemSize, maxPossibleSystemSize);
    } else {
        recommendedSystemSize = requiredSystemSize;
    }


    recommendedSystemSize = requiredSystemSize;
    console.log("Max Possible System Size:", maxPossibleSystemSize);
    console.log("Recommended System Size:", recommendedSystemSize);

    pricePerWatt = getPricePerWatt(recommendedSystemSize);
    console.log("Price Per Watt:", pricePerWatt);

    // Electricity generation estimation (assuming 4 hours of peak sunlight per day)
    var dailyGeneration = recommendedSystemSize * peakSunlightHours;
    var monthlyGeneration = dailyGeneration * 30;
    var monthlySaving = monthlyGeneration * pricePerUnit;


    console.log("Daily Generation:", dailyGeneration);
    console.log("Monthly Generation:", monthlyGeneration);

    // Carbon footprint reduction estimation (assuming 0.922 kg CO2 per kWh)
    var monthlyCO2Reduction = monthlyGeneration * 0.922;
    console.log("Monthly CO2 Reduction:", monthlyCO2Reduction);


    // Electricity generation estimation (assuming 4 hours of peak sunlight per day)
    var dailyGeneration = recommendedSystemSize * 4;
    var monthlyGeneration = dailyGeneration * 30;

    // Carbon footprint reduction estimation (assuming 0.922 kg CO2 per kWh)
    var monthlyCO2Reduction = monthlyGeneration * 0.922;

    // Battery cost estimation based on user's system type choice
    var batterySize = recommendedSystemSize * backupDays;

    // Battery cost estimation
    var batteryCost = 0;
    if (systemType === 'off-grid' || systemType === 'hybrid') {
        var batterySize = recommendedSystemSize * backupDays;
        if (batteryType === 'lithium') {
            if (batterySize <= 5) batteryCost = 550000;
            else if (batterySize <= 10) batteryCost = 1100000;
            else if (batterySize <= 20) batteryCost = 2200000;
            else batteryCost = 2200000 + (batterySize - 20) * (2200000 / 20);
        } else {
            if (batterySize <= 5) batteryCost = 275000;
            else if (batterySize <= 10) batteryCost = 550000;
            else if (batterySize <= 20) batteryCost = 1100000;
            else batteryCost = 1100000 + (batterySize - 20) * (1100000 / 20);
        }
    }

    updateBackupDaysAndBatteryTypeDisplay();


    var installationCost = recommendedSystemSize * 1000 * pricePerWatt;  // converting kW to W for multiplication

    var totalCost = installationCost + batteryCost;
    var cumulativeSavings = 0;
    var yearsToPayback = 0;

    while (cumulativeSavings < totalCost) {
        cumulativeSavings += (monthlySaving * 12) * (1 + 0.10 * yearsToPayback); // Increasing by 10% for inflation
        yearsToPayback++;
    }

    // Adjust for partial years
    yearsToPayback = yearsToPayback - 1 + (totalCost - cumulativeSavings + monthlySaving * 12) / (monthlySaving * 12);


    // Display the results to the user
    outputDiv.innerHTML = `
    <strong>Estimation:</strong><br>
    Recommended System Size: ${recommendedSystemSize.toFixed(2)} kW<br>
    Monthly Generation: ${monthlyGeneration.toFixed(2)} kWh<br>
    Monthly CO2 Reduction: ${monthlyCO2Reduction.toFixed(2)} kg<br>
    Estimated Battery Cost: PKR ${batteryCost.toFixed(2)}<br>
    Estimated Installation Cost: PKR ${installationCost.toFixed(2)}<br>
    Estimated Payback Period: ${yearsToPayback.toFixed(2)} years<br>
    <em>Note: This payback period is calculated while assuming a 10% inflation rate. In Pakistan, the inflation rate is fluctuating, which can result in a shorter payback time.</em>
`;



});

document.getElementById('system-type').addEventListener('change', updateBackupDaysAndBatteryTypeDisplay);

function updateBackupDaysAndBatteryTypeDisplay() {
    const systemType = document.getElementById('system-type').value;
    const batteryTypeGroup = document.getElementById('battery-type-group');
    const backupDaysGroup = document.getElementById('backup-days-group');
    const netmeteringGroup = document.getElementById('netmetering-group');

    if (systemType === 'off-grid' || systemType === 'hybrid') {
        batteryTypeGroup.style.display = 'block';
        backupDaysGroup.style.display = 'block';
    } else {
        batteryTypeGroup.style.display = 'none';
        backupDaysGroup.style.display = 'none';
    }

    if (systemType === 'hybrid') {
        netmeteringGroup.style.display = 'block';
    } else {
        netmeteringGroup.style.display = 'none';
    }
}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getMaxPossibleSystemSize(space) {
    return space / 100;  // Assuming 100 sq ft per kW
}


function getPricePerWatt(systemSize) {
    // Using average values instead of random values
    if (systemSize <= 3) return 180;
    if (systemSize <= 5) return 175;
    if (systemSize <= 10) return 170;
    if (systemSize <= 20) return 165;
    if (systemSize <= 30) return 160;
    if (systemSize <= 50) return 155;
    if (systemSize <= 100) return 150;
    return 0;
}

function getBatteryCost(batteryType, batterySize) {
    let baseCostPerKWh;
    let efficiencyLossOverTime;

    if (batteryType === 'lithium') {
        baseCostPerKWh = 220000 / 20; // Example base cost
        efficiencyLossOverTime = 0.02; // Example: 2% efficiency loss per year
    } else { // tubular
        baseCostPerKWh = 110000 / 20; // Example base cost
        efficiencyLossOverTime = 0.04; // Example: 4% efficiency loss per year
    }

    let totalCost = baseCostPerKWh * batterySize;

    // Adjust the cost for efficiency loss if the battery is expected to be replaced after it becomes inefficient
    totalCost *= (1 + efficiencyLossOverTime);

    return totalCost;
}

function getCostBreakdown(systemSize, pricePerWatt) {
    // ... (this function remains unchanged)
}
