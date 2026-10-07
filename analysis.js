function getRSIStatus(rsi) {

    if (rsi === null) {
            return "데이터 부족";
                }

                    if (rsi < 30) {
                            return "과매도";
                                }

                                    if (rsi > 70) {
                                            return "과매수";
                                                }

                                                    return "중립";
                                                    }


                                                    function getMACDStatus(macd) {

                                                        if (macd === null) {
                                                                return "데이터 부족";
                                                                    }

                                                                        if (macd > 0) {
                                                                                return "상승 우세";
                                                                                    }

                                                                                        if (macd < 0) {
                                                                                                return "하락 우세";
                                                                                                    }

                                                                                                        return "중립";
                                                                                                        }


                                                                                                        function getMAStatus(current, ma20, ma60) {

                                                                                                            if (
                                                                                                                    current === null ||
                                                                                                                            ma20 === null ||
                                                                                                                                    ma60 === null
                                                                                                                                        ) {
                                                                                                                                                return "데이터 부족";
                                                                                                                                                    }

                                                                                                                                                        if (
                                                                                                                                                                current > ma20 &&
                                                                                                                                                                        current > ma60
                                                                                                                                                                            ) {
                                                                                                                                                                                    return "상승 추세";
                                                                                                                                                                                        }

                                                                                                                                                                                            if (
                                                                                                                                                                                                    current < ma20 &&
                                                                                                                                                                                                            current < ma60
                                                                                                                                                                                                                ) {
                                                                                                                                                                                                                        return "하락 추세";
                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                return "혼조";
                                                                                                                                                                                                                                }


                                                                                                                                                                                                                                function updateAnalysisCards(
                                                                                                                                                                                                                                    current,
                                                                                                                                                                                                                                        ma20,
                                                                                                                                                                                                                                            ma60,
                                                                                                                                                                                                                                                rsi,
                                                                                                                                                                                                                                                    macd
                                                                                                                                                                                                                                                    ) {

                                                                                                                                                                                                                                                        const aiMessage =
                                                                                                                                                                                                                                                                document.getElementById("aiMessage");

                                                                                                                                                                                                                                                                    if (!aiMessage) return;

                                                                                                                                                                                                                                                                        const rsiStatus =
                                                                                                                                                                                                                                                                                getRSIStatus(rsi);

                                                                                                                                                                                                                                                                                    const macdStatus =
                                                                                                                                                                                                                                                                                            getMACDStatus(macd);

                                                                                                                                                                                                                                                                                                const maStatus =
                                                                                                                                                                                                                                                                                                        getMAStatus(
                                                                                                                                                                                                                                                                                                                    current,
                                                                                                                                                                                                                                                                                                                                ma20,
                                                                                                                                                                                                                                                                                                                                            ma60
                                                                                                                                                                                                                                                                                                                                                    );

                                                                                                                                                                                                                                                                                                                                                        aiMessage.innerHTML =
                                                                                                                                                                                                                                                                                                                                                                "<b>이동평균:</b> " +
                                                                                                                                                                                                                                                                                                                                                                        maStatus +
                                                                                                                                                                                                                                                                                                                                                                                "<br><br>" +

                                                                                                                                                                                                                                                                                                                                                                                        "<b>RSI:</b> " +
                                                                                                                                                                                                                                                                                                                                                                                                rsiStatus +
                                                                                                                                                                                                                                                                                                                                                                                                        "<br><br>" +

                                                                                                                                                                                                                                                                                                                                                                                                                "<b>MACD:</b> " +
                                                                                                                                                                                                                                                                                                                                                                                                                        macdStatus;
                                                                                                                                                                                                                                                                                                                                                                                                                        }
