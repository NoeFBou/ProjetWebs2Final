import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from "next/dynamic";

const Slider = dynamic(() => import("react-slick").then((m) => m.default), {
    ssr: false
});

type SlideProps = {
    title: string;
};

const Slide = ({ title }: SlideProps) => {
    return (
        <HStack
            w="１００％"
            h="200px"
            bg="#ef430e"
            border="cyan.700"
            alignContent="center"
            justifyContent="center"
            mx="4"
        >
            <Text color="white" fontWeight="bold">
                {title}
            </Text>
        </HStack>
    );
};

function App() {

    const slickSettings = {
        dots: true,
        infinite: true,
        speed: 1000,
        autoplay: true,
        slidesToShow: 3
    };

  return (
      <>
          <div className="App">
              <Box m="20">
                  <Box
                      sx={{
                          ".slick-dots": {
                              transform: "translateY(1em)"
                          },
                          ".slick-dots li button": {
                              _before: {
                                  transition: "0.2s",
                                  content: "''",
                                  borderRadius: "100%",
                                  background: "cyan.500"
                              }
                          },
                          ".slick-arrow": {
                              backgroundColor: "#950d36",
                              color: "white",
                              w: "30px",
                              h: "50px",
                              transition: "0.2s",
                              _hover: {
                                  backgroundColor: "#950d36",
                                  color: "white"
                              },
                              _focus: {
                                  backgroundColor: "#ef430e",
                                  color: "white"
                              },
                              _before: {
                                  transition: "0.2s"
                              }
                          },
                          ".slick-prev": {
                              left: "-40px",
                              _before: {
                                  content: '"◀"'
                              }
                          },
                          ".slick-next": {
                              right: "-40px",
                              _before: {
                                  content: '"▶"'
                              }
                          }
                      }}
                  >
                      <Slider {...slickSettings}>
                          <Slide title={"スライド１"}/>
                          <Slide title={"スライド２"}/>
                          <Slide title={"スライド３"}/>
                          <Slide title={"スライド４"}/>
                          <Slide title={"スライド５"}/>
                      </Slider>
                  </Box>
              </Box>
          </div>
      </>
  )
}

export default App
