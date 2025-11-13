'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockVehicles } from '@/lib/mock-data';
import { Vehicle } from '@/types/schedule';
import { Car, Search, Plus, Edit, Wrench } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter((v) =>
    v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusConfig = {
    available: { label: 'Available', className: 'bg-green-600' },
    'in-use': { label: 'In Use', className: 'bg-blue-600' },
    maintenance: { label: 'Maintenance', className: 'bg-orange-600' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">Manage fleet vehicles and their status</p>
        </div>

        <div className="mb-6 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-blue-700 hover:bg-blue-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const statusInfo = statusConfig[vehicle.status];
            return (
              <Card key={vehicle.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Car className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{vehicle.vehicleNumber}</h3>
                      <p className="text-sm text-gray-500">ID: {vehicle.id}</p>
                    </div>
                  </div>
                  <Badge className={`${statusInfo.className} text-white`}>
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">Delivery Van</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Service:</span>
                    <span className="font-medium text-gray-900">Jan 10, 2024</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Wrench className="h-3 w-3 mr-1" />
                    Service
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
