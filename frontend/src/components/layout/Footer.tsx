import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-neutral-200 py-4 text-center text-sm text-neutral-500">
    ZoeFlockAdmin &copy; {new Date().getFullYear()} - All rights reserved.
  </footer>
);

export default Footer; 