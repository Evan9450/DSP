'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockDrivers } from '@/lib/mock-data';
import { Driver } from '@/types/schedule';
import { User, Search, Plus, Phone, Mail } from 'lucide-react';

export default function DriversPage() {
  const [drivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.amazonId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">Manage driver information and contacts</p>
        </div>

        <div className="mb-6 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-blue-700 hover:bg-blue-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Driver
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="h-8 w-8 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{driver.name}</h3>
                  <Badge className="bg-orange-600 text-white mt-1">{driver.amazonId}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                {driver.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{driver.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{driver.name.toLowerCase().replace(' ', '.')}@dsp.com</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Shifts:</span>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-green-600">4.8 ⭐</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
