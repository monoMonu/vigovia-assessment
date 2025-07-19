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


const COST_PER_NIGHT_PER_ROOM = 4000; // ₹4000 per night per hotel room
const COST_PER_FLIGHT = 8000;         // ₹8000 per flight per traveler
const COST_PER_ACTIVITY = 500;        // ₹500 per activity per traveler

const ItineraryGenerator = () => {
   const [isGenerating, setIsGenerating] = useState(false);
   const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
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
               nights: 0,
            }
         ],
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
   const calculatedTotal = calculateTotalAmount(watchedData);

   const addActivity = (dayIndex) => {
      const currentDay = watchedData.days[dayIndex];
      const updatedActivities = [...currentDay.activities, {
         time: 'Afternoon',
         title: '',
         description: '',
         duration: '',
         type: 'Sightseeing'
      }];
      setValue(`days.${dayIndex}.activities`, updatedActivities);
   };

   const removeActivity = (dayIndex, activityIndex) => {
      const currentDay = watchedData.days[dayIndex];
      const updatedActivities = currentDay.activities.filter((_, index) => index !== activityIndex);
      setValue(`days.${dayIndex}.activities`, updatedActivities);
   };

   const onSubmit = async (data) => {
      setIsGenerating(true);
      try {
         const pdfGenerator = new PDFGenerator();
         await pdfGenerator.generatePDF({...data, totalAmount: calculateTotalAmount(watchedData)});
         toast.success('Itinerary generated successfully!');
      } catch (error) {
         console.error('Error generating PDF:', error);
         toast.error('Failed to generate itinerary. Please try again.');
      }
      setIsGenerating(false);
   };

   function calculateTotalAmount(data) {
      const travelers = parseInt(data.travelers || 1, 10);

      // Hotel cost
      const hotelCost = (data.hotels || []).reduce((sum, hotel) => {
         const nights = parseInt(hotel.nights || 0, 10);
         return sum + (nights * COST_PER_NIGHT_PER_ROOM);
      }, 0);

      // Flight cost per traveler
      const flightCost = (data.flights?.length || 0) * COST_PER_FLIGHT * travelers;

      // Activity cost per traveler
      const activityCount = data.days?.reduce((total, day) => {
         return total + (day.activities?.length || 0);
      }, 0);
      const activityCost = activityCount * COST_PER_ACTIVITY * travelers;

      return hotelCost + flightCost + activityCost;
   };

   const calculateNights = (date1, date2) => {
      if (date1 && date2) {
         const departure = new Date(date1);
         const returnDate = new Date(date2);
         const diffTime = Math.abs(returnDate - departure);
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         return diffDays;
      }
      return 0;
   };

   return (
      <div className="min-h-screen bg-gray-50">
         <Header />

         <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
               <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Perfect Itinerary</h1>
                  <p className="text-gray-600">Design a customized travel experience with detailed day-by-day planning</p>
               </div>

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="card">
                     <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-vigovia-purple" />
                        Basic Information
                     </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer Name *
                           </label>
                           <input
                              {...control.register('customerName', { required: 'Customer name is required' })}
                              className="input-field"
                              placeholder="Enter customer name"
                           />
                           {errors.customerName && (
                              <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Destination *
                           </label>
                           <input
                              {...control.register('destination', { required: 'Destination is required' })}
                              className="input-field"
                              placeholder="e.g., Singapore"
                           />
                           {errors.destination && (
                              <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
                           )}
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
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Departure From *
                           </label>
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

                        <div className="bg-blue-50 p-4 rounded-lg">
                           <p className="text-sm text-blue-800">
                              <strong>Total Estimated Amount:</strong> ₹{calculatedTotal}
                           </p>
                        </div>

                        <div>
                           <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-blue-800">
                                 <strong>Trip Duration:</strong> {calculateNights(watchedData.departureDate, watchedData.returnDate) && 
                                    `${calculateNights(watchedData.departureDate, watchedData.returnDate)} nights, ${calculateNights(watchedData.departureDate, watchedData.returnDate) + 1} days`}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Daily Itinerary */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                           <Calendar className="w-6 h-6 text-vigovia-purple" />
                           Daily Itinerary
                        </h2>
                        <button
                           type="button"
                           onClick={() => appendDay({
                              date: '',
                              activities: [{
                                 time: 'Morning',
                                 title: '',
                                 description: '',
                                 duration: '',
                                 type: 'Sightseeing'
                              }]
                           })}
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
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                 </label>
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

                              {watchedData.days[dayIndex]?.activities?.map((activity, activityIndex) => (
                                 <div key={activityIndex} className="bg-gray-50 p-3 rounded border">
                                    <div className="flex justify-between items-start mb-3">
                                       <span className="text-sm font-medium text-gray-700">Activity {activityIndex + 1}</span>
                                       {watchedData.days[dayIndex].activities.length > 1 && (
                                          <button
                                             type="button"
                                             onClick={() => removeActivity(dayIndex, activityIndex)}
                                             className="text-red-500 hover:text-red-700"
                                          >
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                       <div>
                                          <select
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.time`)}
                                             className="input-field text-sm"
                                          >
                                             <option value="Morning">Morning</option>
                                             <option value="Afternoon">Afternoon</option>
                                             <option value="Evening">Evening</option>
                                             <option value="Night">Night</option>
                                          </select>
                                       </div>

                                       <div>
                                          <input
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.title`)}
                                             placeholder="Activity title"
                                             className="input-field text-sm"
                                          />
                                       </div>

                                       <div>
                                          <input
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.duration`)}
                                             placeholder="Duration (e.g., 2-3 Hours)"
                                             className="input-field text-sm"
                                          />
                                       </div>

                                       <div>
                                          <select
                                             {...control.register(`days.${dayIndex}.activities.${activityIndex}.type`)}
                                             className="input-field text-sm"
                                          >
                                             <option value="Sightseeing">Sightseeing</option>
                                             <option value="Adventure">Adventure</option>
                                             <option value="Cultural">Cultural</option>
                                             <option value="Relaxation">Relaxation</option>
                                             <option value="Shopping">Shopping</option>
                                             <option value="Food">Food & Dining</option>
                                          </select>
                                       </div>
                                    </div>

                                    <div className="mt-3">
                                       <textarea
                                          {...control.register(`days.${dayIndex}.activities.${activityIndex}.description`)}
                                          placeholder="Activity description"
                                          className="input-field text-sm"
                                          rows="2"
                                       />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Flight Details */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                           <Plane className="w-6 h-6 text-vigovia-purple" />
                           Flight Details
                        </h2>
                        <button
                           type="button"
                           onClick={() => appendFlight({
                              date: '',
                              airline: 'Air India',
                              from: '',
                              to: '',
                              departure: '',
                              arrival: ''
                           })}
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
                                    <option value="Air India">Air India</option>
                                    <option value="IndiGo">IndiGo</option>
                                    <option value="SpiceJet">SpiceJet</option>
                                    <option value="Vistara">Vistara</option>
                                    <option value="Singapore Airlines">Singapore Airlines</option>
                                    <option value="Emirates">Emirates</option>
                                 </select>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                 <input
                                    {...control.register(`flights.${index}.from`)}
                                    placeholder="Departure city"
                                    className="input-field"
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                                 <input
                                    {...control.register(`flights.${index}.to`)}
                                    placeholder="Arrival city"
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

                  {/* Hotel Bookings */}
                  <div className="card">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                           <Hotel className="w-6 h-6 text-vigovia-purple" />
                           Hotel Bookings
                        </h2>
                        <button
                           type="button"
                           onClick={() => appendHotel({
                              city: '',
                              name: '',
                              checkIn: '',
                              checkOut: '',
                              nights: 1
                           })}
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
                                    <strong>Total days:</strong> {'0' && calculateNights(watchedData.hotels[index].checkIn, watchedData.hotels[index].checkOut)}
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

                  {/* Payment Plan */}
                  <div className="card">
                     <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <IndianRupee className="w-6 h-6 text-vigovia-purple" />
                        Payment Plan
                     </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Installment (₹)
                           </label>
                           <input
                              type="number"
                              min="0"
                              {...control.register('installment1')}
                              className="input-field"
                              placeholder="Initial payment amount"
                           />
                           <p className="text-xs text-gray-500 mt-1">Due: Initial Payment</p>
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
                              placeholder="Post visa approval amount"
                           />
                           <p className="text-xs text-gray-500 mt-1">Due: Post Visa Approval</p>
                        </div>
                     </div>

                     <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                           <strong>Remaining Amount:</strong> ₹{Math.max(calculatedTotal - (watchedData.installment1 || 0) - (watchedData.installment2 || 0), 0)}
                           <br />
                           <small>Due: 20 days before departure</small>
                        </p>
                     </div>
                  </div>

                  {/* Generate Button */}
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
            </div>
         </main>

         <Footer />
      </div>
   );
};

export default ItineraryGenerator;