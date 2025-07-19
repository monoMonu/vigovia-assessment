export const calculateNights = (departureDate, returnDate) => {
   if (!departureDate || !returnDate) return 0;
   const departure = new Date(departureDate);
   const returnD = new Date(returnDate);
   const diffTime = Math.abs(returnD - departure);
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString, format = 'dd/MM/yyyy') => {
   if (!dateString) return '';
   try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
   } catch (error) {
      return dateString;
   }
};

export const addDays = (date, days) => {
   const result = new Date(date);
   result.setDate(result.getDate() + days);
   return result;
};