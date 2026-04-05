import { Car, TrainFront, Plane, Bus, TramFront, Bike, CarFront } from 'lucide-react';

export const modeIcons = {
  Cab: Car,
  Train: TrainFront,
  Flight: Plane,
  Bus: Bus,
  Metro: TramFront,
  Auto: Bike,
};

export const fallbackModeIcon = CarFront;

export const MODES = ['Cab', 'Train', 'Flight', 'Bus', 'Metro', 'Auto'];
