'use client';

import {
	AlertCircle,
	Package,
	Plus,
	Search,
	ShoppingCart,
	TrendingDown,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { apiClient } from '@/lib/api/client';
import { useDrivers } from '@/hooks/use-drivers';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AddAssetDialog = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className='bg-blue-700 hover:bg-blue-800 w-40'>
					<Plus className='h-4 w-4 mr-2' />
					Add Asset
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Asset</DialogTitle>
					<DialogDescription>
						Add a new asset to the inventory
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Asset Name</Label>
						<Input id='name' placeholder='Enter asset name' />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='category'>Category</Label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder='Select category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='equipment'>
									Equipment
								</SelectItem>
								<SelectItem value='electronics'>
									Electronics
								</SelectItem>
								<SelectItem value='safety'>Safety</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='quantity'>Quantity</Label>
						<Input id='quantity' type='number' placeholder='0' />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='minThreshold'>Min Threshold</Label>
						<Input
							id='minThreshold'
							type='number'
							placeholder='0'
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						type='submit'
						className='bg-blue-700 hover:bg-blue-800'>
						Add Asset
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddAssetDialog;
