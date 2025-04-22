import { data } from './data.js';
import { renderResults, totalColdRentInput, utilitiesInput, resultsDiv, noCalculationMessage } from './ui.js';

export function calculateRent() {
    const totalColdRent = parseFloat(totalColdRentInput.value);
    data.totalColdRent = isNaN(totalColdRent) || totalColdRent <= 0 ? 0 : totalColdRent; // Store it in our data object, default to 0 if invalid

    // Nebenkosten verarbeiten
    const utilities = parseFloat(utilitiesInput.value);
    data.utilities = isNaN(utilities) ? 0 : utilities; // Store it in our data object, default to 0 if invalid

    let totalArea = 0;
    let totalCommonArea = 0;
    let totalPrivateArea = 0;
    const tenantRentData = {}; // Structure: { tenantId: { privateArea: number, rooms: [], commonAreaShare: number, commonCostShare: number, coldRent: number, utilitiesShare: number, totalRent: number } }

    data.rooms.forEach(room => {
        totalArea += room.area;
        if (room.isCommonArea) {
            totalCommonArea += room.area;
        } else if (room.tenantId !== null) {
            totalPrivateArea += room.area;
            if (!tenantRentData[room.tenantId]) {
                tenantRentData[room.tenantId] = { privateArea: 0, rooms: [], commonAreaShare: 0, commonCostShare: 0, coldRent: 0, utilitiesShare: 0, totalRent: 0 };
            }
            tenantRentData[room.tenantId].privateArea += room.area;
            tenantRentData[room.tenantId].rooms.push(room.name);
        }
    });

    // Check if necessary data is provided
    if (data.totalColdRent <= 0 || totalArea === 0 || (totalPrivateArea <= 0 && Object.keys(tenantRentData).length > 0)) {
        // Hide results and show message if data is incomplete
        resultsDiv.style.display = 'none';
        noCalculationMessage.style.display = 'block';
        return; // Stop calculation here
    }


    const rentPerTotalSqm = data.totalColdRent / totalArea;
    const totalCommonCost = totalCommonArea * rentPerTotalSqm;
    let calculatedTotalRentSum = 0; // For verification

    for (const tenantId in tenantRentData) {
        const tenantData = tenantRentData[tenantId];
        const tenantPrivateArea = tenantData.privateArea;
        const tenantPrivateCost = tenantPrivateArea * rentPerTotalSqm;

        // Calculate share of common costs only if there are common areas and private areas exist
        let tenantShareRatio = 0;
        let tenantCommonCostShare = 0;
        let tenantCommonAreaShare = 0; // Equivalent area
         if (totalCommonArea > 0 && totalPrivateArea > 0) {
             tenantShareRatio = tenantPrivateArea / totalPrivateArea;
             tenantCommonCostShare = tenantShareRatio * totalCommonCost;
             tenantCommonAreaShare = tenantShareRatio * totalCommonArea; // Calculate equivalent common area for display
         }

        // Calculate utilities share based on the same ratio as private area
        const tenantUtilitiesShare = data.utilities > 0 && totalPrivateArea > 0 ?
            (tenantPrivateArea / totalPrivateArea) * data.utilities : 0;

        const tenantColdRent = tenantPrivateCost + tenantCommonCostShare;
        const tenantTotalRent = tenantColdRent + tenantUtilitiesShare;
        calculatedTotalRentSum += tenantTotalRent;

        tenantRentData[tenantId].commonAreaShare = tenantCommonAreaShare;
        tenantRentData[tenantId].commonCostShare = tenantCommonCostShare;
        tenantRentData[tenantId].coldRent = tenantColdRent;
        tenantRentData[tenantId].utilitiesShare = tenantUtilitiesShare;
        tenantRentData[tenantId].totalRent = tenantTotalRent;
    }

     // Calculate costs of unallocated space (not common, not rented)
     let unallocatedArea = 0;
     data.rooms.forEach(room => {
         if(!room.isCommonArea && room.tenantId === null) {
             unallocatedArea += room.area;
         }
     });
     const unallocatedCost = unallocatedArea * rentPerTotalSqm;
     calculatedTotalRentSum += unallocatedCost; // Add cost of unallocated space to checksum


    const calculatedData = {
        totalColdRent: data.totalColdRent,
        utilities: data.utilities,
        totalArea: totalArea,
        totalPrivateArea: totalPrivateArea,
        totalCommonArea: totalCommonArea,
        rentPerTotalSqm: rentPerTotalSqm,
        totalCommonCost: totalCommonCost,
        calculatedTotalRentSum: calculatedTotalRentSum,
        tenantRentData: tenantRentData,
        unallocatedArea: unallocatedArea,
        unallocatedCost: unallocatedCost,
        tenantAreaDistribution: calculateTenantAreaDistribution(data.tenants, data.rooms) // Add tenant area distribution
    };

    renderResults(calculatedData);
}

function calculateTenantAreaDistribution(tenants, rooms) {
    const distribution = {};
    let totalRentedArea = 0;

    // Initialize distribution for all tenants
    tenants.forEach(tenant => {
        distribution[tenant.id] = { name: tenant.name, area: 0 };
    });

    // Calculate private area for each tenant and total rented area
    rooms.forEach(room => {
        if (!room.isCommonArea && room.tenantId !== null) {
            distribution[room.tenantId].area += room.area;
            totalRentedArea += room.area;
        }
    });

    // Calculate percentage for each tenant
    for (const tenantId in distribution) {
        if (totalRentedArea > 0) {
            distribution[tenantId].percentage = (distribution[tenantId].area / totalRentedArea) * 100;
        } else {
            distribution[tenantId].percentage = 0;
        }
    }

    return distribution;
}