import { data } from './data.js';
import { renderResults, totalColdRentInput, utilitiesInput } from './ui.js';

export function calculateRent() {
    const totalColdRent = parseFloat(totalColdRentInput.value);
    if (isNaN(totalColdRent) || totalColdRent <= 0) {
        alert('Bitte eine gültige positive Gesamtkaltmiete eingeben.');
        return;
    }
    data.totalColdRent = totalColdRent; // Store it in our data object

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

    if (totalArea === 0) {
        alert('Keine Flächen vorhanden, Berechnung nicht möglich.');
        return;
    }

    const rentPerTotalSqm = totalColdRent / totalArea;
    const totalCommonCost = totalCommonArea * rentPerTotalSqm;
    let calculatedTotalRentSum = 0; // For verification

    // Handle scenario with only common areas or no private areas
    if (totalPrivateArea <= 0 && Object.keys(tenantRentData).length > 0) {
        alert('Warnung: Es gibt Mieter, aber keine privaten Flächen, auf die Gemeinschaftskosten verteilt werden können.');
        // Maybe distribute common costs equally? Or show an error? For now, skip distribution.
        // totalPrivateArea = 1; // Avoid division by zero, but the result won't be meaningful
    }
    if (totalPrivateArea <= 0 && totalCommonArea > 0) {
         const calculatedData = {
             totalColdRent: totalColdRent,
             utilities: data.utilities,
             totalArea: totalArea,
             totalPrivateArea: totalPrivateArea,
             totalCommonArea: totalCommonArea,
             rentPerTotalSqm: rentPerTotalSqm,
             totalCommonCost: totalCommonCost,
             calculatedTotalRentSum: 0, // Checksum not meaningful here
             tenantRentData: {},
             unallocatedArea: totalArea - totalCommonArea, // All non-common area is unallocated
             unallocatedCost: (totalArea - totalCommonArea) * rentPerTotalSqm
         };
         renderResults(calculatedData);
         return; // Stop calculation here
     }
     if (totalPrivateArea <= 0 && totalCommonArea == 0 && Object.keys(tenantRentData).length == 0) {
          const calculatedData = {
              totalColdRent: totalColdRent,
              utilities: data.utilities,
              totalArea: totalArea,
              totalPrivateArea: totalPrivateArea,
              totalCommonArea: totalCommonArea,
              rentPerTotalSqm: rentPerTotalSqm,
              totalCommonCost: totalCommonCost,
              calculatedTotalRentSum: totalColdRent + data.utilities, // Rent is for unassigned space
              tenantRentData: {},
              unallocatedArea: totalArea,
              unallocatedCost: totalArea * rentPerTotalSqm
          };
          renderResults(calculatedData);
          return;
      }


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
        totalColdRent: totalColdRent,
        utilities: data.utilities,
        totalArea: totalArea,
        totalPrivateArea: totalPrivateArea,
        totalCommonArea: totalCommonArea,
        rentPerTotalSqm: rentPerTotalSqm,
        totalCommonCost: totalCommonCost,
        calculatedTotalRentSum: calculatedTotalRentSum,
        tenantRentData: tenantRentData,
        unallocatedArea: unallocatedArea,
        unallocatedCost: unallocatedCost
    };

    renderResults(calculatedData);
}