import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStyles } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { getDailyCheckInExercise, addDailydPoints, DailyCheckInExerciseData, Question, Statistics, Options } from '../../services/pointsMall';
import { showError, showInfo } from '../../utils/toast';
import { getDeviceCode, getDeviceInfoForAPI } from '../../utils/deviceInfo';


interface DailyCheckInOnAnswerProps {
    visible: boolean;
    points: number;
    onClose?: () => void;
}

const DailyCheckInOnAnswer: React.FC<DailyCheckInOnAnswerProps> = ({ visible, points, onClose }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [answerOptions, setAnswerOptions] = useState<string[]>(Array.from({ length: 5 }, (_, index) => ''));

    // 答对题目数展示字符
    const correctCountText = useMemo(() => {
        // 返回数字前补零2位
        return `已答对${correctCount.toString().padStart(2, '0')}题`;
    }, [correctCount]);

    // 每日打卡练习题数据
    const getDailyCheckInExerciseData = useCallback(async () => {
        try {
            const data: DailyCheckInExerciseData = await getDailyCheckInExercise();
            setQuestions(data.questions);
            console.log('获取每日打卡练习题数据成功', data);
        } catch (error: unknown) {
            console.error('获取每日打卡练习题数据失败:', error);
            showError('获取每日打卡练习题数据失败');
        }
    }, []);

    const onPressLeftButton = useCallback(() => {
        if (questions && questions.length > 0 && currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
        return;
    }, [currentQuestionIndex]);

    const onPressRightButton = useCallback(() => {
        if (questions && questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else if (currentQuestionIndex === questions.length - 1) {
            // showInfo('已经是最后一题');
            handleAddDailyPoints();
            onClose?.();
        }
        return;
    }, [currentQuestionIndex, questions.length]);

    const handleAddDailyPoints = useCallback(async () => {
        try {
            const deviceInfo = await getDeviceInfoForAPI();
            console.log('添加每日打卡练习题积分，设备ID:', deviceInfo.device_code, '积分:', points);
            await addDailydPoints({
                devices: deviceInfo.device_code,
                points: points.toString(),
                "points_type": "daily"
            });
            console.log('添加每日打卡练习题积分成功');
        } catch (error: unknown) {
            console.error('添加每日打卡练习题积分失败:', error);
            showError('添加每日打卡练习题积分失败');
        }
    }, [points]);


    useEffect(() => {
        console.log('DailyCheckInOnAnswer useEffect', visible);
        getDailyCheckInExerciseData();
    }, []);


    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                {/* 点击背景关闭 */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                // onPress={onClose}
                />

                {/* 内容容器 */}
                <View>
                    <Image
                        source={Images.pointsMallAnswerTitle}
                        style={styles.titleImg}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['#FAFFC9', '#FEFFEE', '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.contentContainer}
                    >
                        {/* 顶部横条 */}
                        <LinearGradient
                            colors={['#EBFF61', '#D9FB00']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.topBarContainer}
                        >
                            {/* 答题状态 */}
                            <View style={styles.answerStatusContainer}>
                                <Image
                                    source={Images.pointsMallAnswerStatusIcon}
                                    style={styles.statusIcon}
                                    resizeMode="cover"
                                />
                                <Text style={styles.answerStatusText}>{correctCountText}</Text>
                            </View>
                        </LinearGradient>

                        {/* 答题页状态 */}
                        <View style={styles.pageStatusContainer}>
                            <Text style={styles.currentPageText}>{questions?.length ? currentQuestionIndex + 1 : 0}</Text>
                            <Text style={styles.pageSeparatorText}>/</Text>
                            <Text style={styles.totalPageText}>{questions.length}</Text>
                        </View>

                        {/* 题目 */}
                        <View style={styles.questionContainer}>
                            <Text style={styles.questionText}>{questions[currentQuestionIndex]?.question_text ?? '没有题目'}</Text>
                        </View>

                        {
                            questions &&
                            questions.length > 0 &&
                            questions[currentQuestionIndex]?.options &&
                            <>
                                {/* 分隔线 */}
                                <Image
                                    source={Images.pointsMallAnswerDivider}
                                    style={styles.dividerImg}
                                    resizeMode="contain"
                                />

                                {/* 选项 */}
                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const newAnswerOptions = [...answerOptions];
                                            if (newAnswerOptions[currentQuestionIndex] === '') {
                                                newAnswerOptions[currentQuestionIndex] = 'A';
                                            }
                                            newAnswerOptions[currentQuestionIndex] = 'A';
                                            setAnswerOptions(newAnswerOptions);
                                            if (questions[currentQuestionIndex]?.correct_answer === 'A') {
                                                setCorrectCount((prev) => prev + 1);
                                            }
                                        }}
                                        activeOpacity={0.8}>
                                        <View
                                            style={[
                                                styles.optionsItem,
                                                questions[currentQuestionIndex]?.correct_answer === 'A' && answerOptions[currentQuestionIndex] !== '' && styles.optionsItemCorrect,
                                                answerOptions[currentQuestionIndex] === 'A' && questions[currentQuestionIndex]?.correct_answer !== 'A' && styles.optionsItemWrong,
                                            ]}>
                                            <Image source={Images.pointsMallAnswerOptionA} style={styles.optionsItemIcon} resizeMode="contain" />
                                            <Text style={styles.optionsItemText}>{questions[currentQuestionIndex]?.options?.A ?? ''}</Text>
                                            {questions[currentQuestionIndex]?.correct_answer === 'A' && answerOptions[currentQuestionIndex] !== '' && <Image source={Images.pointsMallAnswerOptionCorrect} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                            {answerOptions[currentQuestionIndex] === 'A' && questions[currentQuestionIndex]?.correct_answer !== 'A' && <Image source={Images.pointsMallAnswerOptionWrong} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            const newAnswerOptions = [...answerOptions];
                                            if (newAnswerOptions[currentQuestionIndex] === '') {
                                                newAnswerOptions[currentQuestionIndex] = 'B';
                                            }
                                            newAnswerOptions[currentQuestionIndex] = 'B';
                                            setAnswerOptions(newAnswerOptions);
                                            if (questions[currentQuestionIndex]?.correct_answer === 'B') {
                                                setCorrectCount((prev) => prev + 1);
                                            }
                                        }}
                                        activeOpacity={0.8}>
                                        <View
                                            style={[
                                                styles.optionsItem,
                                                questions[currentQuestionIndex]?.correct_answer === 'B' && answerOptions[currentQuestionIndex] !== '' && styles.optionsItemCorrect,
                                                answerOptions[currentQuestionIndex] === 'B' && questions[currentQuestionIndex]?.correct_answer !== 'B' && styles.optionsItemWrong,
                                            ]}>
                                            <Image source={Images.pointsMallAnswerOptionB} style={styles.optionsItemIcon} resizeMode="contain" />
                                            <Text style={styles.optionsItemText}>{questions[currentQuestionIndex]?.options?.B ?? ''}</Text>
                                            {questions[currentQuestionIndex]?.correct_answer === 'B' && answerOptions[currentQuestionIndex] !== '' && <Image source={Images.pointsMallAnswerOptionCorrect} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                            {answerOptions[currentQuestionIndex] === 'B' && questions[currentQuestionIndex]?.correct_answer !== 'B' && <Image source={Images.pointsMallAnswerOptionWrong} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const newAnswerOptions = [...answerOptions];
                                            if (newAnswerOptions[currentQuestionIndex] === '') {
                                                newAnswerOptions[currentQuestionIndex] = 'C';
                                            }
                                            newAnswerOptions[currentQuestionIndex] = 'C';
                                            setAnswerOptions(newAnswerOptions);
                                            if (questions[currentQuestionIndex]?.correct_answer === 'C') {
                                                setCorrectCount((prev) => prev + 1);
                                            }
                                        }}
                                        activeOpacity={0.8}>
                                        <View
                                            style={[
                                                styles.optionsItem,
                                                questions[currentQuestionIndex]?.correct_answer === 'C' && answerOptions[currentQuestionIndex] !== '' && styles.optionsItemCorrect,
                                                answerOptions[currentQuestionIndex] === 'C' && questions[currentQuestionIndex]?.correct_answer !== 'C' && styles.optionsItemWrong,
                                            ]}>
                                            <Image source={Images.pointsMallAnswerOptionC} style={styles.optionsItemIcon} resizeMode="contain" />
                                            <Text style={styles.optionsItemText}>{questions[currentQuestionIndex]?.options?.C ?? ''}</Text>
                                            {questions[currentQuestionIndex]?.correct_answer === 'C' && answerOptions[currentQuestionIndex] !== '' && <Image source={Images.pointsMallAnswerOptionCorrect} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                            {answerOptions[currentQuestionIndex] === 'C' && questions[currentQuestionIndex]?.correct_answer !== 'C' && <Image source={Images.pointsMallAnswerOptionWrong} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const newAnswerOptions = [...answerOptions];
                                            if (newAnswerOptions[currentQuestionIndex] === '') {
                                                newAnswerOptions[currentQuestionIndex] = 'D';
                                            }
                                            newAnswerOptions[currentQuestionIndex] = 'D';
                                            setAnswerOptions(newAnswerOptions);
                                            if (questions[currentQuestionIndex]?.correct_answer === 'D') {
                                                setCorrectCount((prev) => prev + 1);
                                            }
                                        }}
                                        activeOpacity={0.8}>
                                        <View
                                            style={[
                                                styles.optionsItem,
                                                questions[currentQuestionIndex]?.correct_answer === 'D' && answerOptions[currentQuestionIndex] !== '' && styles.optionsItemCorrect,
                                                answerOptions[currentQuestionIndex] === 'D' && questions[currentQuestionIndex]?.correct_answer !== 'D' && styles.optionsItemWrong,
                                            ]}>
                                            <Image source={Images.pointsMallAnswerOptionD} style={styles.optionsItemIcon} resizeMode="contain" />
                                            <Text style={styles.optionsItemText}>{questions[currentQuestionIndex]?.options?.D ?? ''}</Text>
                                            {questions[currentQuestionIndex]?.correct_answer === 'D' && answerOptions[currentQuestionIndex] !== '' && <Image source={Images.pointsMallAnswerOptionCorrect} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                            {answerOptions[currentQuestionIndex] === 'D' && questions[currentQuestionIndex]?.correct_answer !== 'D' && <Image source={Images.pointsMallAnswerOptionWrong} style={styles.optionsItemStatusIcon} resizeMode="contain" />}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                        {/* 装饰素材-翻页卷页 */}
                        <Image
                            source={Images.pointsMallAnswerPageCorner}
                            style={styles.decorPageCorner}
                            resizeMode="contain"
                        />
                    </LinearGradient>
                    {/* 按钮容器 */}
                    <View style={styles.buttonContainer}>
                        {/* 按钮 */}
                        <TouchableOpacity onPress={onPressLeftButton} activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#EBFF61', '#D9FB00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={[
                                    styles.button,
                                    (!questions || !(questions.length > 0) || currentQuestionIndex == 0) && { opacity: 0 },
                                ]}>
                                <Text style={styles.buttonText}>上一题</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        {/* 按钮 */}
                        <TouchableOpacity onPress={onPressRightButton} activeOpacity={0.8}>
                            <LinearGradient
                                colors={currentQuestionIndex == questions.length - 1 ? ['#B8FF61', '#8AFB51'] : ['#EBFF61', '#D9FB00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={[
                                    styles.button,
                                    (!questions || !(questions.length > 0)) && { opacity: 0 },
                                ]}>
                                <Text style={styles.buttonText}>{currentQuestionIndex == questions.length - 1 ? '提交并打卡' : '下一题'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    {/* 装饰素材-环 */}
                    <Image
                        source={Images.pointsMallAnswerRing2}
                        style={styles.decorRing2}
                        resizeMode="contain"
                    />
                    {/* 装饰素材-孔 */}
                    <Image
                        source={Images.pointsMallAnswerHole2}
                        style={styles.decorHole2}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = createStyles({
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    backdrop: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明黑色背景
    },
    contentContainer: {
        width: 297.5, // 760
        borderRadius: 10.546875, // 27
        borderBottomRightRadius: 23.4375, // 60
        overflow: 'hidden' as const,
        position: 'relative' as const,
        alignItems: 'center' as const,
    },
    titleImg: {
        position: 'absolute' as const,
        width: 117.96875, // 302
        height: 44.53125, // 114
        top: -10.15625, // -26
        left: -8.984375, // -23
        zIndex: 1,
    },
    topBarContainer: {
        width: '100%' as const,
        height: 30.46875, // 78
        flexDirection: 'row' as const,
        justifyContent: 'flex-end' as const,
        alignItems: 'center' as const,
        shadowColor: '#8A9F00',
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 2.34375,
        },
        shadowRadius: 0.78125,
        elevation: 5,
    },
    answerStatusContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginRight: 28.125, // 72
        gap: 1.953125, // 5
    },
    statusIcon: {
        width: 12.5, // 32
        height: 12.5, // 32
    },
    answerStatusText: {
        fontFamily: 'kingnam_bobo',
        fontWeight: '400' as const,
        fontSize: 10.15625, // 26
        color: '#00000099',
    },
    pageStatusContainer: {
        position: 'absolute' as const,
        right: 12.5, // 32
        top: 39.84375, // 102
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingTop: 1.5625, // 4
        paddingRight: 4.6875, // 12
        paddingBottom: 1.5625, // 4
        paddingLeft: 4.6875, // 12
        backgroundColor: '#68D9FF',
        borderRadius: 16.796875, // 43
    },
    currentPageText: {
        fontFamily: 'kingnam_bobo',
        fontWeight: '400' as const,
        fontSize: 10.15625, // 26
        color: '#FFFFFF',
    },
    pageSeparatorText: {
        fontFamily: 'PingFang SC',
        fontWeight: '600' as const,
        fontSize: 7.8125, // 20
        color: '#FFFFFFB2',
        marginHorizontal: 1.5625, // 4
    },
    totalPageText: {
        fontFamily: 'kingnam_bobo',
        fontWeight: '400' as const,
        fontSize: 8.59375, // 22
        color: '#FFFFFFB2',
    },
    questionContainer: {
        width: '100%' as const,
        minHeight: 73.4375, // 188
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 41.015625, // 105
        paddingVertical: 12.5, // 32
    },
    questionText: {
        fontFamily: 'PingFang SC',
        fontWeight: '500' as const,
        fontSize: 10.9375, // 28
        lineHeight: 21.875, // 56
        color: '#307518',
    },
    dividerImg: {
        width: 253.125, // 648
        height: 1.171875, // 3
    },
    optionsContainer: {
        width: '100%' as const,
        minHeight: 130.46875, // 334
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 21.875, // 56
        paddingVertical: 23.046875, // 59
        gap: 12.5, // 32
    },
    optionsItem: {
        width: 117.1875, // 300
        height: 35.9375, // 92
        borderRadius: 6.5703125, // 16.82px
        backgroundColor: '#F2F4DF' as const,
        flexDirection: 'row' as const,
        justifyContent: 'space-evenly' as const,
        alignItems: 'center' as const,
        borderWidth: 1.5625, // 4
        borderColor: 'transparent' as const,
    },
    optionsItemCorrect: {
        backgroundColor: '#D0FFBBE5' as const,
        borderColor: '#3EDB65' as const,
    },
    optionsItemWrong: {
        borderColor: '#FF6969' as const,
        backgroundColor: '#FFE1E1' as const,
    },
    optionsItemIcon: {
        width: 25, // 64
        height: 25, // 64
        // marginLeft: 6.25, // 16
        // marginRight: 7.8125, // 20
    },
    optionsItemText: {
        fontFamily: 'PingFang SC',
        fontWeight: '500' as const,
        fontSize: 10.9375, // 28
        lineHeight: 21.875, // 56
        color: '#37861C',
    },
    optionsItemStatusIcon: {
        width: 15.625, // 40
        height: 15.625, // 40
        // marginLeft: 7.8125, // 20
    },
    buttonContainer: {
        position: 'absolute' as const,
        bottom: -35.546875, // 91
        width: 297.5, // 760
        flexDirection: 'row' as const,
        justifyContent: 'space-around' as const,
        alignItems: 'center' as const,
    },
    button: {
        width: 78.125, // 200
        height: 24.609375, // 63
        borderRadius: 15.625, // 40
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    buttonText: {
        fontFamily: 'kingnam_bobo',
        fontWeight: '400' as const,
        fontSize: 9.375, // 24
        color: '#00000099',
    },
    decorRing2: {
        width: 7.8125, // 20
        height: 18.75, // 48
        position: 'absolute' as const,
        top: -3.515625, // -9
        right: 14.0625, // 36
        zIndex: 2,
    },
    decorHole2: {
        width: 8.59375, // 22
        height: 8.59375, // 22
        position: 'absolute' as const,
        top: 10.15625, // 26
        right: 12.890625, // 33
        zIndex: 1,
    },
    decorPageCorner: {
        width: 21.875, // 56
        height: 18.359375, // 47
        position: 'absolute' as const,
        bottom: 0,
        right: 0,
    },
    decorTitleTag: {
        width: 75, // 192
        height: 8.984375, // 23
        position: 'absolute' as const,
        top: 15.625, // 40
        left: 19.140625, // 49
        zIndex: 4,
    },
});

export default DailyCheckInOnAnswer;
