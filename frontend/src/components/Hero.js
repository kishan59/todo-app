import { useMaterialUIController, setLayout } from 'context';
import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useSelector } from 'react-redux';

const Hero = () => {
    const [controller, dispatch] = useMaterialUIController();
    const { layout } = controller;
    const { pathname } = useLocation();
    const { userInfo } = useSelector((state) => state.auth);
  
    useEffect(() => {
      if(userInfo){
        setLayout(dispatch, "dashboard");
      }else {
        setLayout(dispatch, "page");
      }
  }, [pathname]);
    // can modify and make common components for both login, dashboard type pages like header footer sidebar etc...

    if(layout === "dashboard") {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <Outlet />
                <Footer />
            </DashboardLayout>
        )
    } else {
        return <Outlet /> 
    }
}

export default Hero
