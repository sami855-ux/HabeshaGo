import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { createVehicle } from "@/services/vehicle.api"
import { Vehicle } from "@/services/vehicle.api"

export const useCreateVehicle = (
  options?: UseMutationOptions<Vehicle, unknown, Vehicle>
) => {
  return useMutation<Vehicle, unknown, Vehicle>({
    mutationFn: (vehicleData: Vehicle) => createVehicle(vehicleData),
    ...options, // allow passing onSuccess, onError, etc.
  })
}
