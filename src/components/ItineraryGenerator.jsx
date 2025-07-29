import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
   Plus,
   Trash2,
   FileText,
   Plane,
   Hotel,
   MapPin,
   Calendar,
   Users,
   IndianRupee
} from 'lucide-react';
import PDFGenerator from './PDFGenerator';
import Header from './Header';
import Footer from './Footer';

const ItineraryGenerator = () => {
   const serverURL = import.meta.env.VITE_SERVER_API;
   const [isGenerating, setIsGenerating] = useState(false);
   const [result, setResult] = useState(null);
   const {
      control,
      handleSubmit,
      watch,
      setValue,
      formState: { errors }
   } = useForm({
      defaultValues: {
         customerName: '',
         destination: '',
         travelers: 1,
         departureFrom: '',
         departureDate: '',
         returnDate: '',
         days: [
            {
               date: '',
               activities: [
                  {
                     time: 'Morning',
                     title: '',
                     description: '',
                     duration: '',
                     type: 'Sightseeing'
                  }
               ]
            }
         ],
         flights: [
            {
               date: '',
               airline: 'Air India',
               from: '',
               to: '',
               departure: '',
               arrival: ''
            }
         ],
         hotels: [
            {
               city: '',
               name: '',
               checkIn: '',
               checkOut: '',
               nights: 1
            }
         ],
         totalAmount: 0,
         installment1: 0,
         installment2: 0
      }
   });

   const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
      control,
      name: 'days'
   });

   const { fields: flightFields, append: appendFlight, remove: removeFlight } = useFieldArray({
      control,
      name: 'flights'
   });

   const { fields: hotelFields, append: appendHotel, remove: removeHotel } = useFieldArray({
      control,
      name: 'hotels'
   });

   const watchedData = watch();

   const addActivity = (dayIndex) => {
      const currentDay = watchedData.days[dayIndex];
      const updatedActivities = [
         ...currentDay.activities,
         {
            time: 'Afternoon',
            title: '',
            description: '',
            duration: '',
            type: 'Sightseeing'
         }
      ];
      setValue(`days.${dayIndex}.activities`, updatedActivities);
   };

   const removeActivity = (dayIndex, activityIndex) => {
      const currentDay = watchedData.days[dayIndex];
      const updatedActivities = currentDay.activities.filter((_, i) => i !== activityIndex);
      setValue(`days.${dayIndex}.activities`, updatedActivities);
   };

   const calculateNights = (checkIn, checkOut) => {
      if (checkIn && checkOut) {
         const start = new Date(checkIn);
         const end = new Date(checkOut);
         const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
         return diff > 0 ? diff : 0;
      }
      return 0;
   };

   const onSubmit = async (data) => {
      setIsGenerating(true);
      try {
         const sanitizedData = {
            ...data,
            travelers: Number(data.travelers),
            totalAmount: Number(data.totalAmount),
            installment1: Number(data.installment1),
            installment2: Number(data.installment2),
            hotels: data.hotels.map(hotel => ({
               ...hotel,
               nights: Number(hotel.nights)
            })),
            days: data.days.map(day => ({
               ...day,
               activities: day.activities.map(act => ({
                  ...act,
                  duration: Number(act.duration) || 0
               }))
            }))
         };
         
         // console.log("Requets : ", JSON.stringify(sanitizedData));
         const res = await fetch(`${serverURL}/generate-itinerary`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedData)
         });

         const resData = await res.json();

         setResult(resData);

         if (!res.ok) throw new Error("Bad response");
         toast.success('Itinerary generated successfully!');
      } catch (error) {
         console.error('Error generating PDF:', error);
         toast.error('Failed to generate itinerary. Please try again.');
      }
      setIsGenerating(false);
   };


   const remainingBalance = watchedData.totalAmount - watchedData.installment1 - watchedData.installment2;

   return (
      <div className="min-h-screen bg-gray-50">
         <Header />

         <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
               <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Post-Booking Itinerary Details</h1>
                  <p className="text-gray-600">Review and customize your finalized travel itinerary</p>
               </div>

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="card">
                     <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-vigovia-purple" />
                        Basic Information
                     </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                           <input
                              {...control.register('customerName', { required: 'Customer name is required' })}
                              className="input-field"
                              placeholder="Enter customer name"
                           />
                           {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>}
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                           <input
                              {...control.register('destination', { required: 'Destination is required' })}
                              className="input-field"
                              placeholder="e.g., Singapore"
                           />
                           {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>}
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Users className="inline w-4 h-4 mr-1" />
                              Number of Travelers *
                           </label>
                           <input
                              type="number"
                              min="1"
                              {...control.register('travelers', { required: 'Number of travelers is required', min: 1 })}
                              className="input-field"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Departure From *</label>
                           <input
                              {...control.register('departureFrom', { required: 'Departure location is required' })}
                              className="input-field"
                              placeholder="e.g., Delhi"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="inline w-4 h-4 mr-1" />
                              Departure Date *
                           </label>
                           <input
                              type="date"
                              {...control.register('departureDate', { required: 'Departure date is required' })}
                              className="input-field"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="inline w-4 h-4 mr-1" />
                              Return Date *
                           </label>
                           <input
                              type="date"
                              {...control.register('returnDate', { required: 'Return date is required' })}
                              className="input-field"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                           <Calendar className="w-6 h-6 text-vigovia-purple" />
                           Daily Itinerary
                        </h2>
                        <button
                           type="button"
                           onClick={() =>
                              appendDay({
                                 date: '',
                                 activities: [
                                    {
                                       time: 'Morning',
                                       title: '',
                                       description: '',
                                       duration: '',
                                       type: 'Sightseeing'
                                    }
                                 ]
                              })
                           }
                           className="btn-secondary"
                        >
                           <Plus className="w-4 h-4" />
                           Add Day
                        </button>
                     </div>

                     {dayFields.map((day, dayIndex) => (
                        <div key={day.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-900">Day {dayIndex + 1}</h3>
                              {dayFields.length > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => removeDay(dayIndex)}
                                    className="btn-danger"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              )}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                 <input
                                    type="date"
                                    {...control.register(`days.${dayIndex}.date`)}
                                    className="input-field"
                                 />
                              </div>
                           </div>

                           <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                 <h4 className="font-medium text-gray-900">Activities</h4>
                                 <button
                                    type="button"
                                    onClick={() => addActivity(dayIndex)}
                                    className="btn-secondary text-xs"
                                 >
                                    <Plus className="w-3 h-3" />
                                    Add Activity
                                 </button>
                              </div>

                              {(watchedData.days?.[dayIndex]?.activities || []).map((activity, activityIndex) => (
                                 <div
                                    key={activityIndex}
                                    className="border border-gray-300 rounded p-3 relative"
                                 >
                                    {watchedData.days[dayIndex].activities.length > 1 && (
                                       <button
                                          type="button"
                                          onClick={() => removeActivity(dayIndex, activityIndex)}
                                          className="absolute top-2 right-2 btn-danger btn-sm"
                                       >
                                          <Trash2 className="w-3 h-3" />
                                       </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                       <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                          <select
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.time`)}
                                             className="input-field"
                                          >
                                             <option>Morning</option>
                                             <option>Afternoon</option>
                                             <option>Evening</option>
                                             <option>Night</option>
                                          </select>
                                       </div>

                                       <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                          <input
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.title`)}
                                             placeholder="Activity title"
                                             className="input-field"
                                          />
                                       </div>

                                       <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                          <input
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.duration`)}
                                             placeholder="e.g., 2 hours"
                                             className="input-field"
                                          />
                                       </div>

                                       <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                          <select
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.type`)}
                                             className="input-field"
                                          >
                                             <option>Sightseeing</option>
                                             <option>Meal</option>
                                             <option>Transfer</option>
                                             <option>Leisure</option>
                                          </select>
                                       </div>
                                    </div>

                                    <div className="mt-2">
                                       <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                       <textarea
                                          {...control.register(`days.${dayIndex}.activities.${activityIndex}.description`)}
                                          rows={2}
                                          placeholder="Brief description"
                                          className="input-field resize-none"
                                       />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                           <Plane className="w-6 h-6 text-vigovia-purple" />
                           Flight Details
                        </h2>
                        <button
                           type="button"
                           onClick={() =>
                              appendFlight({
                                 date: '',
                                 airline: 'Air India',
                                 from: '',
                                 to: '',
                                 departure: '',
                                 arrival: ''
                              })
                           }
                           className="btn-secondary"
                        >
                           <Plus className="w-4 h-4" />
                           Add Flight
                        </button>
                     </div>

                     {flightFields.map((flight, index) => (
                        <div key={flight.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-900">Flight {index + 1}</h3>
                              {flightFields.length > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => removeFlight(index)}
                                    className="btn-danger"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              )}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                 <input
                                    type="date"
                                    {...control.register(`flights.${index}.date`)}
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Airline</label>
                                 <select
                                    {...control.register(`flights.${index}.airline`)}
                                    className="input-field"
                                 >
                                    <option>Air India</option>
                                    <option>IndiGo</option>
                                    <option>Vistara</option>
                                    <option>SpiceJet</option>
                                    <option>GoAir</option>
                                 </select>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                 <input
                                    {...control.register(`flights.${index}.from`)}
                                    placeholder="Departure airport/city"
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                                 <input
                                    {...control.register(`flights.${index}.to`)}
                                    placeholder="Arrival airport/city"
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                                 <input
                                    type="time"
                                    {...control.register(`flights.${index}.departure`)}
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                                 <input
                                    type="time"
                                    {...control.register(`flights.${index}.arrival`)}
                                    className="input-field"
                                 />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                           <Hotel className="w-6 h-6 text-vigovia-purple" />
                           Hotel Bookings
                        </h2>
                        <button
                           type="button"
                           onClick={() =>
                              appendHotel({
                                 city: '',
                                 name: '',
                                 checkIn: '',
                                 checkOut: '',
                                 nights: 1
                              })
                           }
                           className="btn-secondary"
                        >
                           <Plus className="w-4 h-4" />
                           Add Hotel
                        </button>
                     </div>

                     {hotelFields.map((hotel, index) => (
                        <div key={hotel.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-900">Hotel {index + 1}</h3>
                              {hotelFields.length > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => removeHotel(index)}
                                    className="btn-danger"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              )}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                 <input
                                    {...control.register(`hotels.${index}.city`)}
                                    placeholder="Hotel city"
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                                 <input
                                    {...control.register(`hotels.${index}.name`)}
                                    placeholder="Hotel name"
                                    className="input-field"
                                 />
                              </div>

                              <div className="bg-blue-50 p-4 rounded-lg">
                                 <p className="text-sm text-blue-800">
                                    <strong>Total nights:</strong>{' '}
                                    {calculateNights(
                                       watchedData.hotels?.[index]?.checkIn,
                                       watchedData.hotels?.[index]?.checkOut
                                    )}
                                 </p>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                                 <input
                                    type="date"
                                    {...control.register(`hotels.${index}.checkIn`)}
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                                 <input
                                    type="date"
                                    {...control.register(`hotels.${index}.checkOut`)}
                                    className="input-field"
                                 />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="card">
                     <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <IndianRupee className="w-6 h-6 text-vigovia-purple" />
                        Payment Plan
                     </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
                           <input
                              type="number"
                              min="0"
                              {...control.register('totalAmount')}
                              className="input-field"
                              placeholder="Total booked amount"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Installment (₹)
                           </label>
                           <input
                              type="number"
                              min="0"
                              {...control.register('installment1')}
                              className="input-field"
                              placeholder="First installment paid"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Second Installment (₹)
                           </label>
                           <input
                              type="number"
                              min="0"
                              {...control.register('installment2')}
                              className="input-field"
                              placeholder="Second installment paid"
                           />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                           <p className="text-sm text-blue-800">
                              <strong>Remaining Balance :</strong>{' '}
                              Rs. {remainingBalance > 0 ? remainingBalance : 0}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="text-center">
                     <button
                        type="submit"
                        disabled={isGenerating}
                        className={`btn-primary text-lg px-8 py-4 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                        <FileText className="w-5 h-5" />
                        {isGenerating ? 'Generating...' : 'Generate Itinerary PDF'}
                     </button>
                  </div>
               </form>

               <div className='pt-8 px-5 text-center'>
                  {result ? 
                  <p>
                     Genearted PDF : <a href={result.url} className='text-blue-500 underline'>{result.url}</a>
                  </p> : 
                  <p>
                     Generated PDF Link will appear here...   
                  </p>}
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default ItineraryGenerator;
